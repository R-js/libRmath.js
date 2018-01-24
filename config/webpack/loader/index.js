const { resolve } = require('path');
const merge = require('lodash.merge');

const proto = {
    tslint: o => ({
        loader: 'tslint-loader',
        options: merge({
            configFile: resolve('tslint.json'),
            emitErrors: true,
            failOnHint: true,
            //https://github.com/wbuchwalter/tslint-loader/issues/76
            typeCheck: false,
            fix: true,
            tsConfigFile: resolve('tsconfig.json')
        }, o)
    }),
    atl: o => ({
        loader: 'awesome-typescript-loader',
        options: merge({
            configFileName: resolve('tsconfig.json'),
            // Babel configuration
            babelOptions: {
                babelrc: false,
                presets: [
                    ['env',
                        {
                            loose: true,
                            modules: false,
                            "targets": "last 2 versions, ie 11"
                        }
                    ],
                    'stage-0'
                ]
            },
            // Tells ATL to use Babel
            useBabel: false,
            // Cache output for quicker compilation
            useCache: true
        }, o)
    })
};



module.exports = proto;