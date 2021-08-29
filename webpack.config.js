const path = require('path');

module.exports = {
    entry: './src/script.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'script.js',
    },
    devtool: 'source-map',
    devServer: {
         contentBase: './public',
     },

    optimization: {
        usedExports: true,
    },
};