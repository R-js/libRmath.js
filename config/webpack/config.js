'use strict';

const { resolve } = require('path');
const { lint, tsc } = require('./module/rules')
const { rm, uglify } = require('./plugins');
const { extensions, /* plugins*/ } = require('./resolve');
const { wPackN_Ext } = require('./externals');

const baseConfig = {
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
    externals: [
        wPackN_Ext() //for examples see ./externals/index.js
    ],
    module: {
        rules: [
            lint(),
            tsc({ declaration: true })
        ]
    },
    plugins: [
        rm({ paths: ['lib'] })
    ],
    resolve: {
        extensions,
        //   plugins
    }
}

module.exports = function(env) {
    const configs = [
      { ...baseConfig, target: 'node' },
      { ...baseConfig, target: 'web' },
    ];

    //env specific adjustments
    if (/prod/i.test(env)) {
        configs.forEach(conf => conf.plugins.push(uglify()));
    }

    configs.forEach(conf => {
        conf.module.rules.forEach(rule => {
            rule.include = rule.include || [];
            rule.include.push(resolve('src/lib'));
        });
    });
    return configs;
}
