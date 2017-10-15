const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { resolve } = require('path');

// Which files should be excluded from the compilation?
const exclude = /node_modules/;
// Loaders respond differently depending on the NODE_ENV environment variable
const p = process.env.NODE_ENV === 'production';
const fonts = {
    test: /(\.svg|\.woff|\.woff2|\.[ot]tf|\.eot)$/,
    loader: 'file-loader?name=[name].[ext]'
};

const css = {
    loader: 'css-loader',
    options: {
        // Enable CSS Modules
        modules: true,
        importLoaders: 1,
        // Mangle CSS class names
        localIdentName: p
            ? '[hash:base64:5]'
            : '[name]__[local]__[hash:base64:5]',
        // Minimize CSS for faster loading
        minimize: p,
        // Enable source maps if in production mode
        sourceMap: p
    }
};

const inliner = {
    test: /\.(js|css)$/,
    include: [resolve('src/lib/vendor/cdn')],
    loader: 'file-loader?name=[name].[ext]'
};

const postcss = {
    loader: 'postcss-loader',
    options: {
        plugins: loader => [
            require('postcss-cssnext')() // Autoprefixer
        ],
        sourceMap: p // Enable source maps if in production
    }
};

const raw = {
    test: /\.(sql|gql)/,
    exclude,
    include: [],
    use: 'raw-loader'
};

const scss = {
    loader: 'sass-loader',
    options: {
        sourceMap: p // Enable scss source maps if in production
    }
};

const style = {
    loader: 'style-loader',
    options: {
        sourceMap: p // Enable style source maps if in production
    }
};

const styles = {
    test: /\.((s[ca])|(c))ss$/,
    exclude,
    include: [],
    use: p // If we're in production, extract css, if not, inline css
        ? ExtractTextPlugin.extract({
              fallback: style,
              use: [css, postcss, scss]
          })
        : [style, css, postcss, scss]
};

const ts = {
    test: /\.tsx?$/,
    exclude,
    include: [],
    use: {
        loader: 'awesome-typescript-loader',
        options: {
            // Babel configuration
            babelOptions: {
                presets: [
                    ['env', { loose: true, modules: false }],
                    'stage-0',
                    'react'
                ]
            },
            // Tells ATL to use Babel
            useBabel: true,
            // Cache output for quicker compilation
            useCache: true
        }
    }
};

const tslint = {
    enforce: 'pre',
    test: /\.tsx?$/,
    exclude,
    include: [],
    use: [
        {
            loader: 'tslint-loader',
            options: {
                configFile: resolve('tslint.json'),
                emitErrors: false,
                failOnHint: false,
                typeCheck: true,
                fix: true,
                tsConfigFile: resolve('tsconfig.json')
            }
        }
    ]
};

module.exports = { inliner, raw, styles, ts, tslint, fonts };
