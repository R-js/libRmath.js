import { resolve , dirname, extname, join, basename, relative, sep } from 'node:path';
import { lstatSync, readdirSync } from 'node:fs';

export function verifyPaths(paths) {
    if (Object.keys(paths).length === 0){
        return true;
    }
    // must end with '*' or not have '*' at all
    const errors = []
    for (const path of Object.keys(paths)){
        const stars = path.match(/\*/g);
        if (stars?.length > 1){
            errors.push(`Path has more then one "*" token: ${paths}`);
            continue;
        } else if (stars?.length === 1){
            if (!path.endsWith('*')){
                errors.push(`Path "*" token not at the end of path: ${path}`);
                continue;
            }
        } else {
            // exact paths must have only one entry
            if (paths[path].length !== 1){
                errors.push(`exact path aliases must have only one value: [${path}] has ${paths[path].length} values`);
            }
        }
        
    }
    return errors.length ? errors : true;
}

function sortOnStringLengthDescending(a, b){
    return b.length - a.length;
}

export function rankPaths(paths) {
    // search for paths with no '*'
    const names = Object.keys(paths);

    const exactPaths = names.filter(path => /\*/.test(path) === false);
    if (exactPaths.length){
        // sort on lengt
        exactPaths.sort(sortOnStringLengthDescending);
    }
   
    const wildCardPaths = names.filter(path => /\*/.test(path) === true);
    if (wildCardPaths.length){
        // sort on lengt
        wildCardPaths.sort(sortOnStringLengthDescending);
    }
    return { exactPaths, wildCardPaths };
}

function isRelativeImport(path){
    return path.startsWith('./') || path.startsWith('../');
}

function isAliasedPath(path, exact, wildcard){
    if (exact.includes(path)){
        return true;
    }
    for (const wc of wildcard){
        const toMatch = wc.slice(0, -1); // strip off the '*'
        if (path.startsWith(toMatch)){
            return true;
        }
        // could be a directory import
        if (toMatch[toMatch.length - 1] === '/'){
            if (path.startsWith(toMatch.slice(0, -1))){
                return true;
            }
        }
    }
    return false;
}

function walkDirPath(subPaths, basePath, possibleExtensions) {
    // if subPaths is empty on entry it is possible directory import
    if (subPaths.length === 0) {
        subPaths.push('index');
    }
    const current = subPaths.shift();
    const entries = readdirSync(basePath, { withFileTypes: true });
    const possibles = entries.filter(entry => {
        // possible scenarios
        // last subpath?
        if (subPaths.length === 0){
            if (entry.isDirectory() && current === entry.name) { // possible directory import
                return true;
            }
            if (!entry.isFile()) { // no pipes, file sockets, etc
                return false
            }
            // it is a regular file
            const ext = extname(entry.name);
            const fileSansExt = entry.name.replace(ext,'');
            if (fileSansExt === current){
                return true;
            }
            return false;
        }
        // must be a directory and exact match
        if (current === entry.name && entry.isDirectory()){
            return true;
        }
        return false;
    });
    if (subPaths.length > 0){
        if (possibles.length){
            return walkDirPath(structuredClone(subPaths), join(basePath, possibles[0].name), possibleExtensions);
        }
        return
    }
    if (possibles.length === 0) {
        return;
    }
    // handle directory imports
    const dirImports = possibles.filter(possible => possible.isDirectory());
    const fileImports = possibles.filter(possible => possible.isFile());
    // handle file imports first
    for (const ext of possibleExtensions){
        const found = fileImports.find(possible => extname(possible.name) === ext);
        if (found){
            return join(basePath, found.name);
        }
    }
    // handle directory imports
    for (const dirImport of dirImports){
        const found = walkDirPath(['index'], join(basePath, dirImport.name), possibleExtensions);
        if (found) {
            return found;
        }
    }
    return;
}

function resolveAliasPaths(path, pathsDictionary, base, exact, wildcard, possibleExtensions){
    const idxExact = exact.indexOf(path);
    if (idxExact >=  0) {
        return resolve(base, pathsDictionary[exact[idx]][0]);
    }
    const candidates = wildcard
        .map(wc => path.startsWith(wc.slice(0, -1)) || path.startsWith(wc.slice(0, -2)) ? wc : null)
        .filter (f => !!f); // remove nulls
    
    for (const candidate of candidates) {
        const noStar = candidate.slice(0, -1);
        const noSlash = noStar.slice(0, -1);
        const matchedString = path.startsWith(noStar) ? noStar : noSlash;
        
        const possibleDirs = pathsDictionary[candidate];
        // we have to resolve each array element untill we find it
        for (const replace of possibleDirs) {
            const dir = resolve(base, replace.slice(0, -1));
            // must be a dir
            let lstat;
            try {
                lstat = lstatSync(dir);
            } catch (err) {
                console.log(`lstat failed for ${replace} aliased by ${candidate}, with error ${String(err)}`);
                continue;
            }
            if (!lstat.isDirectory()){
                console.log(`${replace} aliased by ${candiate} is not a directory`);
                continue;
            }
            // so we have a directory
            // replace alias prefix with real full dir
            const subPathElts = path.replace(matchedString, '').split('/');
            const actual = walkDirPath(structuredClone(subPathElts), dir, possibleExtensions);
            if (actual){
                return actual;
            }
        }
    }
}

export function resolveToFullPath(module, importStatement, base, pathsDictionary, exact, wildcard, forceExt, possibleExtensions) {
    const node_m = 'node_modules';
    const isAliased = isAliasedPath(importStatement, exact, wildcard);
    const includesNodeModule = importStatement.includes(node_m);
    if (!isRelativeImport(importStatement) && !isAliased) {
        // dont change, this is a npm module import
        return importStatement;
    }
    // relative import or aliased
    if (importStatement.includes(node_m)) {
        const pos = importStatement.lastIndexOf(node_m);
        return importStatement.slice(pos + node_m.length + 1);
    }
    let aliasRelativePath;
    if (isAliased) {
        if (importStatement === '@rng/knuth-taocp-2002'){
            const n = 1;
        }
        const resolved = resolveAliasPaths(importStatement, pathsDictionary, base, exact, wildcard, possibleExtensions)
        if (resolved === importStatement) { // could not be resolved (assume it is node modules or dev forgot to alias in tsconfig.json)
            return resolved;
        }
        if (!resolved) { // because of error (some path element replacement does not exist or no read access)
            return importStatement;
        }
        if (typeof resolved !== 'string') {
            return;
        }
        aliasRelativePath = relative(dirname(module), resolved);
        if (aliasRelativePath[0] !== '.'){
            aliasRelativePath = './' + aliasRelativePath;
        }
    }
    const finalImportStatement = aliasRelativePath || importStatement;
    // possible physical location of a file
    const candidate = resolve(dirname(module), finalImportStatement);
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
            return finalImportStatement.replace(sep, '/') + '/index' + forceExt;
        }
        if (!indexFileExists && !packageJSONExists) {
            throw new Error(
                `directory import does not contain index.(js/mjs/cjs) file or package.json file ${join(
                    finalImportStatement
                )}`
            );
        }
        if (packageJSONExists) {
            // let "export" or "main" property handle it
            return finalImportStatement.replace(sep, '/');
        }
        // only index.js, index.cjs, index.mjs left
        return finalImportStatement.replace(sep, '/') + '/' + indexFileExists;
    }
    // strip optionally the extension
    const ext = extname(candidate);
    const fileNameWithTSExt = (ext === '' ? candidate : candidate.slice(0, -ext.length)) + '.ts';
    lstat = lstatSync(fileNameWithTSExt);
    if (!lstat.isFile()) {
        throw new Error(`file does not exist: ${fileNameWithTSExt}`);
    }
    // must return without extension
    const rc =  (ext === '' ? finalImportStatement : finalImportStatement.slice(0, -ext.length)) + forceExt;
    return rc.replaceAll(sep, '/');
}