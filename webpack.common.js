const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        exclude: [path.resolve(__dirname, 'node_modules')],
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  plugins: [ new CopyPlugin({
    patterns: [
      { from: './src/views', to: './views'},
      { from: './src/public', to: './public'}
    ]
  })],
  node: {
    __dirname: false
  }
}
