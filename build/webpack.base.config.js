const path = require('path');
const autoprefixer = require('autoprefixer');
const babelEnvDeps = require('webpack-babel-env-deps');

module.exports = {
    entry: path.resolve('./src/index.js'),
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            // Resolve using relative path to node modules
            path.resolve('node_modules'),

            // Resolve using relative path to module root
            path.resolve('./src/components'),

            // Resolve using relative path to store
            path.resolve('./src/store/actions'),
            path.resolve('./src/store/reducers'),
        ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        sourceType: 'unambiguous',
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: [
                                            '> 1%',
                                            'last 2 versions',
                                        ],
                                    },
                                    useBuiltIns: 'entry',
                                    debug: true,
                                    loose: true,
                                },
                            ],
                            '@babel/preset-react',
                        ],
                        plugins: [
                            '@babel/plugin-syntax-dynamic-import',
                            '@babel/plugin-syntax-import-meta',
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-proposal-json-strings',
                            [
                                '@babel/plugin-proposal-decorators',
                                {
                                    legacy: true,
                                },
                            ],
                            '@babel/plugin-proposal-function-sent',
                            '@babel/plugin-proposal-export-namespace-from',
                            '@babel/plugin-proposal-numeric-separator',
                            '@babel/plugin-proposal-throw-expressions',
                            '@babel/plugin-transform-arrow-functions',
                            '@babel/plugin-proposal-object-rest-spread',
                        ],
                    },
                },
                exclude: [
                    babelEnvDeps.exclude(),
                ],
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            modules: false,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            indent: 'postcss',
                            plugins: () => [
                                autoprefixer({
                                    browsers: [
                                        '> 1%',
                                        'last 2 versions',
                                    ],
                                }),
                            ],
                        },
                    },
                ],
            },
        ],
    },
};