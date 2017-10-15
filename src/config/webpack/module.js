const { flatten } = require('./tools');
const { inliner, raw, styles, ts, tslint, fonts } = require('./loaders');
module.exports = {
    rules: flatten([inliner, raw, styles, tslint, ts, fonts])
};
