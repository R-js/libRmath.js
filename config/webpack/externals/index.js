const webpackNodeExternals = require('webpack-node-externals');
const merge = require('lodash.merge');
// collecton of external module filters
module.exports = {
    wPackN_Ext: (options) => {
        return webpackNodeExternals(merge({
            //defaults:
            whitelist: [], // no whitelist
            importType: 'commonjs', //externalize as commonjs
            modulesDir: 'node_modules', //directory name of node_modules
            modulesFromFile: false //dont use package.json to get node_module names
        }, options));
    },
    //other filter functions add later

    /* 
    Example: of a filter function
    
    function(context, request, callback) {
         
        console.log(`request: ${request}, context: ${context}`);

        above output output would look like this:
        .
        .
        request: debug,              context: C:\Users\jacob\git-projects\libRmath.js\src\lib\signrank
        request: ../common/_general, context: C:\Users\jacob\git-projects\libRmath.js\src\lib\tukey
        .
        etc

        if (/^debug$/.test(request)) {
            //externalize as commonjs module
            //other options are 
            root: The library should be available as a global variable (e.g. via a script tag).
            commonjs: The library should be available as a CommonJS module.
            commonjs2: Similar to the above but where the export is module.exports.default.
            amd: Similar to commonjs but using AMD module system.
            
            return callback(null, 'commonjs ' + request); 
        }
        callback();
    },
    */
};