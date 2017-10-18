/*const nodeModules = require('fs').readdirSync('node_modules')
    .filter(x => ['.bin'].indexOf(x) === -1)
    .reduce((hash, mod, idx) => hash[mod] = `commonjs ${mod}`, {});*/

const { resolve } = require('path');

const { flatten } = require('./tools');

module.exports = {
    target: 'node',
    entry: {
        server: resolve('src/lib/index.ts')
    },
    output: {
        path: resolve('dist/lib'),
        filename: '[name].js'
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    devtool: require('./devtool'),
    externals: require('./externals'),
    module: require('./module'),
    plugins: require('./plugins').server,
    resolve: require('./resolve'),
};

// Server files live in <projectRoot>/src/{server,lib}
for (const rule of module.exports.module.rules){
    rule.include = rule.include || [];
    rule.include.push(resolve('src/lib'));
}
