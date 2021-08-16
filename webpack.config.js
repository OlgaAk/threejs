const path = require('path');

module.exports = {
    entry: './src/script.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'script.js',
    },
    devtool: false,
    optimization: {
        usedExports: true,
    },
};