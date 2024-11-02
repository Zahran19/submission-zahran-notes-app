// webpack.common.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: './app.js', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Name of the output bundle
    publicPath: '/', // Ensure that assets are served from the root
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/, // Load and combine CSS files
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Handle image files
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images', // Output directory for images
              name: '[name].[ext]', // Format of image file names
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // HTML template utama
      inject: 'body',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: './style.css', // Output CSS file in style folder
    }),
  ],
};