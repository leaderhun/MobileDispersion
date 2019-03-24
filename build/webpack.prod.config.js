const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
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
        output: {
            path: path.resolve('./dist'),
            filename: 'dispersion.js',
            publicPath: '',
            libraryTarget: 'var',
            library: 'Dispersion',
        },
        mode: 'production',
        devtool: '',
        plugins: [
            new webpack.DefinePlugin(envKeys),
        ],
        optimization: {
            minimizer: [new TerserPlugin({
                cache: true,
                parallel: true,
            })],
        },
    });
};