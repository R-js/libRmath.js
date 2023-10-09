import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'url';
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @param {string[]} moduleNames
 * @param {string} containingFile
 * @param {string[]| undefined} reusedNames
 * @param {ts.ResolvedProjectReference | undefined} redirectedReference
 * @param {ts.CompilerOptions} options
 * @param {ts.SourceFile} containingSourceFile
   @returns {ts.ResolvedModuleFull[]}
*/

function resolveModuleNames(
        moduleNames,
        containingFile,
        reusedNames,
        redirectedReference,
        options,
        containingSourceFile
    ) {
        //console.log('compiler options: %o', options);
        const resolvedModules = [];
        for (const moduleName of moduleNames) {
            // try to use standard resolution
            //console.log('resolving moduleName [%s], from: [%s], re-usednames: [%o]', moduleName, containingFile, reusedNames);
            let result = ts.resolveModuleName(moduleName, containingFile, options, {
                fileExists,
                readFile
            });
            //console.log('(i have a possible result) resolving moduleName [%s], from: [%s]', moduleName, containingFile);
            if (result.resolvedModule) {
                //console.log('[%s] module resolved, result=[%o]', moduleName, result.resolvedModule);
                resolvedModules.push(result.resolvedModule);
            } else {
                //console.log('[%s], could not resolve, result is: [%o]', moduleName, result);
                // check fallback locations, for simplicity assume that module at location
                // should be represented by '.d.ts' file
                //resolvedModules.push({ resolvedFileName: undefined });
                /*for (const location of moduleSearchLocations) {
                  const modulePath = path.join(location, moduleName + ".d.ts");
                  if (fileExists(modulePath)) {
                    resolvedModules.push({ resolvedFileName: modulePath });
                  }
                }*/
            }
        }
        return resolvedModules;
    }


const entryFile = resolve('src/index.ts');
/**
 * 
 * @param {string} fileName 
 * @returns {boolean}
 */
function fileExists(fileName) {
    return ts.sys.fileExists(fileName);
}

/**
 * 
 * @param {string} fileName 
 * @returns {string|undefined}
 */
function readFile(fileName) {
    return ts.sys.readFile(fileName);
}

/**
 * 
 * @param {string} fileName 
 * @param {ts.ScriptTarget} languageVersion 
 * @param {(message: string) => void} [onError]
 * @returns {ts.SourceFile|undefined}
 */
function getSourceFile(fileName, languageVersion, onError) {
//    console.log('trying to read source from [%s]', fileName);
    const sourceText = ts.sys.readFile(fileName);
//    console.log('ln:[%s], sourceText of [%s] is [%o]', languageVersion, fileName, sourceText);
    if (sourceText) {
        const srcFile = ts.createSourceFile(fileName, sourceText, languageVersion);
        console.log('[%s], created Source', fileName, srcFile);
        return srcFile;
    }
    if (onError) {
        console.log('invoking on error');
        onError(`cant find file ${fileName}`);
    }
    return undefined;
}

/**
 * 
 * @param {ts.CompilerOptions} options 
 * @return {ts.CompilerHost}
 */

function createCompilerHost(options) {
    return {
        getSourceFile,
        getDefaultLibFileName: () => "lib.d.ts",
        writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getDirectories: path => ts.sys.getDirectories(path),
        getCanonicalFileName: fileName =>
            ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
        getNewLine: () => ts.sys.newLine,
        useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
        fileExists,
        readFile,
       // type resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames: string[] | undefined, redirectedReference: ResolvedProjectReference | undefined, options: CompilerOptions, containingSourceFile?: SourceFile): (ResolvedModule | undefined)[];
        resolveModuleNames: resolveModuleNames,
    };
}

/**
 * 
 * @param {string[]} fileNames 
 * @param {ts.CompilerOptions} options 
 * @return {void}
 */

function compile(fileNames, options) {
    const host = createCompilerHost(options);
    let program = ts.createProgram(fileNames, options, host);
    let emitResult = program.emit();

    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            // @ts-ignore
            let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.log('34', `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.log('&3', ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}

compile([entryFile], {
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    //noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    baseUrl: 'src',
    lib: ["es2020", "dom"],
    types: ["node", "jest"],
    typeRoots: ["src/packages/__test__/jest-ext.d.ts", "node_modules/@types"],
    paths: {
        '@common/*': ["lib/common/*", "packages/common/*", "packages/__test__/*"],
        "@lib/*": ["lib/*"],
        "@rng/*": ["lib/rng/*"],
        "@special/*": ["lib/special/*"],
        "@trig/*": ["lib/trigonometry/*"],
        "@dist/*": ["lib/distributions/*"]
    },
});
