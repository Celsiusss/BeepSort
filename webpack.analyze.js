const { merge } = require('webpack-merge');
const development = require('./webpack.dev');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(development, {
    plugins: [
        new BundleAnalyzerPlugin()
    ]
});
