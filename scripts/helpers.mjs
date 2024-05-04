import { resolve , dirname, extname } from 'node:path';
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

function resolveAliasPaths(path, pathsDictionary, base, exact, wildcard, forceExt){
    const idxExact = exact.indexOf(path);
    if (idxExact >=  0){
        return resolve(base, pathsDictionary[exact[idx]][0]);
    }
    const candidates = wildCard
        .map(wc => {
            const noStar = wc.slice(0, -1);
            if (path.startsWith(noStar)){
                return path;
            }
            const noSlash = noStar.slice(0, -1);
            if (path.startsWith(noSlash)){
                return path;
            }
            return null;
        })
        .filter (f => !!f); // remove nulls
    
    for (const candidate of candidates){
        const noStar = condidate.slice(0, -1);
        const noSlash = noStar.slice(0, -1);
        const matchedString = path.startsWith(noStar) ? noStar : noSlash;

        const possibleDirs = pathsDictionary[candidate];
        // we have to resolve each array element untill we find it
        for (const replace of possibleDirs){
            const noStar = replace.splice(0, -1);
            const dir = resolve(base, noStar);
            // must be a dir
            let lstat;
            try {
                lstat = lstatSync(candidate);
            } catch (err) {
                // nothing
            }
            if (!lstat) {
                console.log(`lstat failed for ${candidate}`);
                continue;
            }
            if (!lstat.isDirectory()){
                console.log(`not a directory: ${candidate}`);
                continue;
            }
            // so we have a directory


        }
    }
    
}

export function resolveToFullPath(module, importStatement, forceExt, base, pathsDictionary, exact, wildcard) {
    const node_m = 'node_modules';
    const isAliased = isAliasedPath(importStatement, exact, wildcard);
    const includesNodeModule = importStatement.includes(node_m);
    if (!isRelativeImport(importStatement) && !isAliased) {
        // dont change, this is a npm module import
        return importStatement;
    }
    if (importStatement.includes(node_m)) {
        const pos = importStatement.lastIndexOf(node_m);
        return importStatement.slice(pos + node_m.length + 1);
    }
    if (isAliased){
        const find = resolveAliasPaths(importStatement, pathsDictionary, base, exact.wildcard, forceExt)
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