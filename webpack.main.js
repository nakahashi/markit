module.exports = {
  entry: './src/app.js',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
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
