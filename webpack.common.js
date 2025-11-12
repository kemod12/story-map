const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Set public path for GitHub Pages
const publicPath = process.env.NODE_ENV === 'production' 
  ? '/story-map/'
  : '/';

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
    'service-worker': path.resolve(__dirname, 'src/service-worker.js'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'docs'),
    publicPath: publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      base: process.env.NODE_ENV === 'production' ? '/story-map/' : '/',
      publicPath: process.env.NODE_ENV === 'production' ? '/story-map/' : '/',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
  ],
};
