const { resolve } = require('path');
const exclude = [];
const { atl, tslint } = require('../loader')
const defaults = require('lodash.defaults');

const rules = {
    lint: (lo, ro) => defaults({
        enforce: 'pre',
        use: tslint(lo),
        test: /\.tsx?$/
    }, ro),
    tsc: (lo, ro) => defaults({
        test: /\.tsx?$/,
        use: atl(lo)
    }, ro),
};


module.exports = rules;