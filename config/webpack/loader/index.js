const { resolve } = require('path');
const merge = require('lodash.merge');

const proto = {
    tslint: o => ({
        loader: 'tslint-loader',
        options: merge({
            configFile: resolve('tslint.json'),
            emitErrors: true,
            failOnHint: true,
            typeCheck: true,
            fix: true,
            tsConfigFile: resolve('tsconfig.json')
        }, o)
    }),
    atl: o => ({
        loader: 'awesome-typescript-loader',
        options: merge({
            // Babel configuration
            babelOptions: {
                presets: [
                    ['env', { loose: true, modules: false }],
                    'stage-0'
                ]
            },
            // Tells ATL to use Babel
            useBabel: true,
            // Cache output for quicker compilation
            useCache: true
        }, o)
    })
};



module.exports = proto;