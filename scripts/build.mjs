#!/usr/bin/env node
// @ts-check4785838a-0a9e-41fa-a217-4bd234c00c9e

import { readdirSync, lstatSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { join, relative, dirname, extname, resolve } from 'node:path';
import ts from 'typescript';
import { parse } from 'acorn';
import jxpath from '@mangos/jxpath';
import { generate } from 'escodegen';

function removeSafeDir(dir) {
    try {
        rmSync(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

function getAllRootSourceFiles() {
    let sourceFiles = ['./index.ts'];
    return sourceFiles.map((f) => join('src', f));
}

function resolveToFullPath(module, importStatement, forceExt) {
    const node_m = 'node_modules';
    if (!importStatement.startsWith('./') && !importStatement.startsWith('../')) {
        // dont change, this is a npm module import
        return importStatement;
    }
    if (importStatement.includes(node_m)) {
        const pos = importStatement.lastIndexOf(node_m);
        return importStatement.slice(pos + node_m.length + 1);
    }
    // possible physical location of a file
    const candidate = resolve(dirname(module), importStatement);
    // is it a dir ?
    let lstat = {
        isDirectory() {
            return false;
        }
    };
    try {
        lstat = lstatSync(candidate);
    } catch (err) {
        // nothing
    }

    if (lstat.isDirectory()) {
        // try index import
        const dirEntries = readdirSync(candidate);
        let indexTSFileExists = '';
        let packageJSONExists = '';
        let indexFileExists = '';
        for (const dirEntry of dirEntries) {
            if (dirEntry === 'index.ts') {
                indexTSFileExists = dirEntry;
                continue;
            }
            if (dirEntry === 'package.json') {
                packageJSONExists = dirEntry;
                continue;
            }
            if (dirEntry === 'index' + forceExt) {
                indexFileExists = dirEntry;
                continue;
            }
        }
        if (indexTSFileExists) {
            return importStatement + '/index' + forceExt;
        }
        if (!indexFileExists && !packageJSONExists) {
            throw new Error(
                `directory import does not contain index.(js/mjs/cjs) file or package.json file ${join(
                    importStatement
                )}`
            );
        }
        if (packageJSONExists) {
            // let "export" or "main" property handle it
            return importStatement;
        }
        // only index.js, index.cjs, index.mjs left
        return importStatement + '/' + indexFileExists;
    }
    // strip optionally the extension
    const ext = extname(candidate);
    const fileNameWithTSExt = (ext === '' ? candidate : candidate.slice(0, -ext.length)) + '.ts';
    lstat = lstatSync(fileNameWithTSExt);
    if (!lstat.isFile()) {
        throw new Error(`file does not exist: ${fileNameWithTSExt}`);
    }
    // must return without extension
    return (ext === '' ? importStatement : importStatement.slice(0, -ext.length)) + forceExt;
}

/**
 * Compiles files to JavaScript.
 *
 * @param {string[]} files
 * @param {ts.CompilerOptions} options
 */
function createCompiler(config, sourceDir) {
    return function compile(files, targetDIR, options) {
        const compilerOptions = { ...config.compilerOptions, ...options };
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
                        const requireStatements = jxpath(
                            '/**/[type=CallExpression]/callee/[type=Identifier]/[name=require]/../arguments/[type=Literal]/',
                            astTree
                        );
                        // loop over all .js and change then

                        for (const node of requireStatements) {
                            node.value = resolveToFullPath(fileName, node.value, '.cjs');
                        }

                        contents = generate(astTree);
                        path = extname(path) === '' ? path + '.cjs' : path.slice(0, -extname(path).length) + '.cjs';
                        break;
                    }
                    case ts.ModuleKind.ES2020: {
                        const importStatements = Array.from(jxpath('/**/[type=ImportDeclaration]/source/', astTree));
                        for (const node of importStatements) {
                            if (node !== null && node !== undefined) {
                                node.value = resolveToFullPath(fileName, node.value, '.mjs');
                                console.log(node.value);
                            }
                        }
                        const exportStatements = Array.from(
                            jxpath('/**/[type=/ExportAllDeclaration|ExportNamedDeclaration/]/source', astTree)
                        );
                        try {
                            for (const node of exportStatements) {
                                if (node !== null && node !== undefined) {
                                    node.value = resolveToFullPath(fileName, node.value, '.mjs');
                                }
                            }
                        } catch (err) {
                            console.log(err);
                        }
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
            } catch (err) {
                onError && onError(err.message);
                // eslint-disable-next-line no-console
                console.log('Fail', path);
            }
        }; // host.writeFile function definition end

        const program = ts.createProgram(files, compilerOptions, host);
        program.emit();
    };
}

function init(targetDir, commenjsDir, esmDir) {
    removeSafeDir(targetDir);
    mkdirSync(commenjsDir, { recursive: true });
    mkdirSync(esmDir, { recursive: true });
    // Read the TypeScript config file.
    const { config } = ts.readConfigFile('tsconfig.json', (fileName) => readFileSync(fileName).toString());
    const sourceDir = join('src');
    const { baseUrl, paths } = config.compilerOptions;

    const compile = createCompiler(config, sourceDir);

    compile(getAllRootSourceFiles(), esmDir, {
        module: ts.ModuleKind.ES2020,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        declaration: true,
        declarationDir: './types', // this becomes ./dist/types
        declarationMap: false,
        removeComments: true,
        sourceMap: false,
        importHelpers: false,
        outDir: undefined
    });

    compile(getAllRootSourceFiles(), commenjsDir, {
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        declaration: false,
        outDir: undefined, // this is a must!
        declarationMap: false,
        removeComments: true,
        sourceMap: false,
        importHelpers: false // commonjs sometimes needs some extra code to create analogs for esm constructs (example export * from 'xyz)
    });
}

init('./dist', './dist/commonjs', './dist/esm');
