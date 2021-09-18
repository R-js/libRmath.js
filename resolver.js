/*{
    "basedir": string,
    "conditions": [string],
    "defaultResolver": "function(request, options)",
    "extensions": [string],
    "moduleDirectory": [string],
    "paths": [string],
    "packageFilter": "function(pkg, pkgdir)",
    "pathFilter": "function(pkg, path, relativePath)",
    "rootDir": [string]
  }*/

export default function resolve (path, obj){
    console.log(`path:${path}`);
    return obj.defaultResolver(path, obj);
};
