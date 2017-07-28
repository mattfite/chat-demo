const path = require('path');

module.exports = {
    entry: {
        index: './src/index.js',
        socketio: './src/socketio.js',
        app: './src/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'public/js'),
        publicPath: '/js/',
        filename: '[name].js'
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
