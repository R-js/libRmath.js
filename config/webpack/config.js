'use strict';

const { resolve } = require('path');
const { lint, tsc } = require('./module/rules')
const { rm, uglify } = require('./plugins');
const { extensions, plugins } = require('./resolve');
module.exports = [{
    target: "node",
    entry: {
        libR: resolve('src/lib/index.ts'),
        "libR.min": resolve('src/lib/index.ts')
    },
    output: {
        path: resolve('dist/lib'),
        filename: '[name].js',
        libraryTarget: 'umd2',
        library: 'libR'
    },
    node: {
        __dirname: false,
        __filename: false,
    },
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
    resolve: {
        extensions,
        plugins
    },
}];

// Server files live in <projectR{oot>/src/{server,lib}
module.exports.map((m) => {
    for (const rule of m.module.rules) {
        rule.include = rule.include || [];
        rule.include.push(resolve('src/lib'));
    }
});