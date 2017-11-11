'use strict';

const { resolve } = require('path');
const { lint, tsc } = require('./module/rules')

module.exports = [{
    target: 'node',
    entry: {
        index: resolve('src/lib/index.ts')
    },
    output: {
        path: resolve('dist/lib'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'libRMath'
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    devtool: false,
    externals: [...require('./externals')],
    module: {
        rules: [
            //lint(),
            tsc()
        ]
    },
    plugins: require('./plugin'),
    resolve: require('./resolve'),
}];

// Server files live in <projectR{oot>/src/{server,lib}
module.exports.map((m) => {
    for (const rule of m.module.rules) {
        rule.include = rule.include || [];
        rule.include.push(resolve('src/lib'));
    }
});