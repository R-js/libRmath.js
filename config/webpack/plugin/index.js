const { resolve } = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');


const cleanLib = new CleanWebpackPlugin(['lib'], {
    root: resolve('dist'),
    verbose: true,
    dry: false,
});

const misc = [
    new webpack.DefinePlugin({
        'LIB_R_MATH_PRODUCTION': false
    }),
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
    })
];

module.exports = [cleanLib];