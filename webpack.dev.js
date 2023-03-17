// jsのビルド
// scssのビルド
// HTMLのコピー

const {merge} = require('webpack-merge');
const main = require('./webpack.main.js');
const renderer = require('./webpack.renderer.js');

module.exports = merge(main, renderer, {
  mode: 'development',
  devtool: 'inline-source-map'
});
