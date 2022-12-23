const path = require('path');

module.exports = {
  entry: './src/renderer/post.js',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'post.js'
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options:  {
            plugins: [
              '@babel/plugin-proposal-function-bind',
            ],
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  // 必要な分だけのpolyfillを自動でインポート
                  "useBuiltIns": "entry"
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
