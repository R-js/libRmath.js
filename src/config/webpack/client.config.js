const { resolve } = require('path');

const p = process.env.NODE_ENV === 'production';

module.exports = {
    entry: {
        app: resolve('src/client/Main.tsx')
    },
    output: {
        path: resolve('dist/client'),
        filename: p ? '[name].[chunkhash].js' : '[name].js'
    },
    devtool: require('./devtool'),
    module: require('./module'), // loaders go here
    plugins: require('./plugins').client,
    resolve: require('./resolve'),
};

// Client files live in <projectRoot>/src/client
for (const rule of module.exports.module.rules) {
    rule.include = rule.include || [];
    rule.include.push(resolve('src/client'), resolve('src/lib'));
}

//console.log(require('util').inspect(module.exports, { depth: null }));
