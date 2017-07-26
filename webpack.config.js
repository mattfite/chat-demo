const path = require('path');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        publicPath: '/js/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: [ 'es2015' ]
                }
            },
            {
                test: /\.json?$/,
                exclude: /(node_modules)/,
                loader: 'json-loader'
            }
        ]
    }
};
