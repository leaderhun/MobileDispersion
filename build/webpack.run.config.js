const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');

module.exports = (env) => {
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    return ({
        entry: baseConfig.entry,
        resolve: baseConfig.resolve,
        module: baseConfig.module,
        mode: 'development',
        output: {
            path: path.resolve('./dist'),
            filename: 'dispersion.js',
            publicPath: '',
            libraryTarget: 'var',
            library: 'Dispersion',
        },
        devtool: 'cheap-module-eval-source-map',
        plugins: [
            new webpack.DefinePlugin(envKeys),
            new HtmlWebpackPlugin({
                template: path.resolve('./src/index.html'),
                filename: 'index.html',
                inject: 'body',
            }),
        ],
    });
};