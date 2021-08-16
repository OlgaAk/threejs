const path = require('path');

module.exports = {
    entry: './src/script.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'script.js',
    },
    mode: 'development',
    optimization: {
        usedExports: true,
    },
};