const { flatten } = require('./tools');
const {  inliner, raw, ts, tslint } = require('./loaders');
module.exports = {
    rules: flatten([inliner, raw, tslint, ts])
};
