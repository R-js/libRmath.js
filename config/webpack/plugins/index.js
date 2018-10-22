const { resolve } = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { defaults, defaultsDeep } = require('lodash');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const plugins = {
    rm: o => new CleanWebpackPlugin(
        o.paths, //relative to what will be defined in root
        defaults({
            root: resolve('dist')
        }, {

        })
    ),
    defines: o => new webpack.DefinePlugin(o),
    uglify: () => new UglifyJsPlugin()/*defaultsDeep({
        cache: true,
        include: /\.min\.js$/,
        extractComments: true,
        sourceMap: true,
        uglifyOptions: {
            compress: true //for now this is enough
        }
    }, o))*/

};

module.exports = plugins;