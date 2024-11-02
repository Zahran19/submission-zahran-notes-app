// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map', // For easier debugging in development
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve content from the dist directory
    },
    compress: true, // Enable compression
    port: 9001, // Port for the webpack-dev-server
    historyApiFallback: true, // Fallback to index.html for SPA routing
    hot: true, // Enable hot module replacement
  },
});