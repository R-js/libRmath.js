'use strict';

const { resolve } = require('path');
const { lint, tsc } = require('./module/rules')
const { rm, uglify } = require('./plugins');

module.exports = [{
    target: "node",
    entry: {
        libR: resolve('src/lib/index.ts'),
        "libR.min": resolve('src/lib/index.ts')
    },
    output: {
        path: resolve('dist/lib'),
        filename: '[name].js',
        //libraryTarget: 'umd2',
        //library: 'libRMath'
    },
    /* node: {
         __dirname: false,
         __filename: false,
     },*/
    devtool: 'source-map',
    externals: [...require('./externals')],
    module: {
        rules: [
            lint(),
            tsc({ declaration: true })
        ]
    },
    plugins: [
        rm({ paths: ['lib'] }),
        uglify()
    ],
    resolve: require('./resolve'),
}];

// Server files live in <projectR{oot>/src/{server,lib}
module.exports.map((m) => {
    for (const rule of m.module.rules) {
        rule.include = rule.include || [];
        rule.include.push(resolve('src/lib'));
    }
});