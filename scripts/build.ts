#!/usr/bin/env node
// @ts-check4785838a-0a9e-41fa-a217-4bd234c00c9e

// TODO: resolve paths like described here
// https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths


import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { join, relative, dirname, extname } from 'node:path';
import { parse } from 'acorn';
import { generate } from 'escodegen';
import { verifyPaths, rankPaths, resolveToFullPath } from './helpers.mjs';
import { recursiveDescend } from './nodeWalker';
import ts from "typescript";


function removeSafeDir(dir: string) {
    try {
        rmSync(dir, { recursive: true });
    } catch (error: any) {
        if (error.code !== 'ENOENT') throw error;
    }
}


/**
 * Compiles files to JavaScript.
 *
 * @param {string[]} files
 * @param {ts.CompilerOptions} options
 */
function createCompiler(config: any, sourceDir: string) {
    return function compile(files: string[], targetDIR: string, options: Record<string, unknown>, possibleExtensions: string[]) {
        const compilerOptions = { ...config.compilerOptions, ...options };
        const { baseUrl, paths } = compilerOptions;
        const pathVerifyResult = verifyPaths(paths);
        if (Array.isArray(pathVerifyResult)) {
            const messages = pathVerifyResult.join('\n');
            throw new Error(messages);
        }
        const { exactPaths, wildCardPaths } = rankPaths(paths);
        const host = ts.createCompilerHost(compilerOptions);
        let nr = 0;
        host.writeFile = function (fileName, contents, _writeByteOrderMark, onError, _sourceFiles) {
            const isDts = fileName.endsWith('.d.ts');
            if (isDts && fileName.endsWith('src/lib/rng/knuth-taocp/index.js')) {
                nr++;
            }
            const relativeToSourceDir = relative(sourceDir, fileName);
            const subDir = join(targetDIR, dirname(relativeToSourceDir));

            mkdirSync(subDir, { recursive: true });

            let path = join(targetDIR, relativeToSourceDir);

            if (!isDts && !fileName.endsWith('.map')) {
                const astTree = parse(contents, {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                    ranges: true,
                    locations: false
                });

                switch (compilerOptions.module) {
                    case ts.ModuleKind.CommonJS: {
                        const requireStatements: any[] = [];
                        recursiveDescend(
                            astTree as any,
                            (node: any) => {
                                let flag = false;
                                if (node?.type === 'CallExpression') {
                                    const callee = node?.callee;
                                    if (callee?.type === 'Identifier' && callee?.name === 'require') {
                                        flag = true;
                                    }
                                }
                                if (flag && node?.arguments) {
                                    for (const args of node?.arguments) {
                                        if (args?.type === 'Literal') {
                                            return node;
                                        }
                                    }
                                }
                            },
                            requireStatements
                        );
                        const finalRequires = requireStatements
                            .filter((_node: any) => _node?.arguments)
                            .reduce((collector: any, _node: any) => {
                                const _requireStatements = _node.arguments.filter((args: any) => args?.type === 'Literal');
                                collector.push(..._requireStatements);
                                return collector;
                            }, []);

                        // loop over all .js and change them

                        for (const node of finalRequires) {
                            node.value = resolveToFullPath(fileName, node.value, baseUrl, paths, exactPaths, wildCardPaths, '.cjs', possibleExtensions);
                        }

                        contents = generate(astTree);
                        path = extname(path) === '' ? path + '.cjs' : path.slice(0, -extname(path).length) + '.cjs';
                        break;
                    }
                    case ts.ModuleKind.ES2020: {
                        const importStatements: any[] = [];
                        recursiveDescend(
                            astTree as any,
                            (node: any) => {
                                if (node?.type === 'ImportDeclaration') {
                                    if (node?.source) {
                                        return node;
                                    }
                                }
                            },
                            importStatements
                        );
                        importStatements
                            .filter((_node: any) => _node?.source).forEach(_node => {
                                _node.source.value = resolveToFullPath(fileName, _node.source.value, baseUrl, paths, exactPaths, wildCardPaths, '.mjs', possibleExtensions);
                            });
                        const exportStatements: any[] = [];
                        recursiveDescend(
                            astTree as any,
                            (node: any) => {
                                if (['ExportAllDeclaration', 'ExportNamedDeclaration'].includes(node?.type)) {
                                    if (node?.source) {
                                        return node;
                                    }
                                }
                            },
                            exportStatements
                        );
                        exportStatements
                            .filter((_node: any) => _node?.source).forEach(_node => {
                                _node.source.value = resolveToFullPath(fileName, _node.source.value, baseUrl, paths, exactPaths, wildCardPaths, '.mjs', possibleExtensions);
                            });
                        contents = generate(astTree);
                        path = extname(path) === '' ? path + '.mjs' : path.slice(0, -extname(path).length) + '.mjs';
                        break;
                    }
                    default:
                        throw Error('Unhandled module type');
                }
            }

            try {
                writeFileSync(path, contents, 'utf-8');
                // eslint-disable-next-line no-console
                console.log('Built', path);
            } catch (err: any) {
                onError && onError(err.message);
                // eslint-disable-next-line no-console
                console.log('Fail', path);
            }
        }; // host.writeFile function definition end

        const program = ts.createProgram(files, compilerOptions, host);
        program.emit();
    };
}

function init(targetDir: string, commenjsDir: string, esmDir: string, roots: string[]) {
    removeSafeDir(targetDir);
    mkdirSync(commenjsDir, { recursive: true });
    mkdirSync(esmDir, { recursive: true });
    // Read the TypeScript config file.
    const { config } = ts.readConfigFile('tsconfig.json', (fileName) => readFileSync(fileName).toString());

    const sourceDir = join('src');

    const compile = createCompiler(config, sourceDir);

    compile(
        roots,
        esmDir,
        {
            module: ts.ModuleKind.ES2020,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            declaration: true,
            declarationDir: './types', // this becomes ./dist/types
            declarationMap: false,
            removeComments: true,
            sourceMap: false,
            importHelpers: false,
            outDir: undefined
        },
        ['.ts']
    );

    compile(
        roots,
        commenjsDir,
        {
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            declaration: false,
            outDir: undefined, // this is a must!
            declarationMap: false,
            removeComments: true,
            sourceMap: false,
            importHelpers: false // commonjs sometimes needs some extra code to create analogs for esm constructs (example export * from 'xyz)
        },
        ['.ts']
    );
}

init('./dist', './dist/commonjs', './dist/esm', ['./src/index.ts']);
