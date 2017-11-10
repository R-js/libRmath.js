const { resolve } = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const { flatten } = require('./tools');

const p = process.env.NODE_ENV === 'production';

/* this is more for documentation
new CleanWebpackPlugin(['dist', 'build'], {
    root: '/full/project/path',
    verbose: true,
    dry: false,
    exclude: ['shared.js']
})
*/

const cleanClient = new (require('clean-webpack-plugin'))(['client'], {
    root: resolve('dist'),
    verbose: true
});

const cleanServer = new (require('clean-webpack-plugin'))(['server'], {
    root: resolve('dist'),
    verbose: true,
    dry: false,
    /* exclude: ['client']*/
});

const sharedProd = !p ? [] : [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
    })
];

/*const html = new (require('html-webpack-plugin'))({
    title: 'BookBarter',
    filename: 'index.html',
    template: require('html-webpack-template'),
    appMountId: 'app',
    inject: false,
    favicon: false,
    minify: p ? {
        caseSensitive: true,
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        html5: true,
        keepClosingSlash: true,
        useShortDoctype: true
    } : false,
    hash: p,
    cache: p,
    showErrors: true,
    xhtml: true,
    baseHref: p ? 'https://www.jacob-bogers.com/' : '/',
    mobile: true,
    inlineManifestWebpackName: p ? 'webpackManifest' : false,
    links: [
        'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
        'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700',
        //'https://s3-us-west-2.amazonaws.com/s.cdpn.io/594328/fonts.css'
    ],
    meta: [
        {
            name: 'description',
            content: 'Book/DVD/Blue-ray trading club, don\'t copy but trade your second hand movies/books for others you haven\'t seen.'
        }
    ]
});

clientProd = !p ? [] : [
    // Extract CSS from bundled JS
    new (require('extract-text-webpack-plugin'))('styles.css'),
    // Extract external code into a separate "vendor" bundle
    new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        // Create implicit vendor bundle
        minChunks: function (module) {
            // Prevent vendor CSS/SASS from being bundled into "vendor.js"
            if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
                return false;
            }

            return module.context && module.context.indexOf("node_modules") !== -1;
        }
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: "manifest",
        minChunks: Infinity
    }),
    new (require('inline-manifest-webpack-plugin'))({
        name: 'webpackManifest'
    })
];
*/
const client = flatten(cleanClient, sharedProd /*, html, clientProd*/);
const server = flatten(cleanServer, sharedProd);


module.exports = { client, server };
