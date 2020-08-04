import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import merge from 'webpack-merge'
import nodeExternals from 'webpack-node-externals'
import path from 'path'
import webpack from 'webpack'
import common from './webpack.common'

module.exports = merge.smart(common, {
  devtool: 'inline-source-map',
  entry: ['webpack/hot/poll?1000', path.join(__dirname, 'src/main.ts')],
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?1000'],
    }),
  ],
  mode: 'development',
  plugins: [new CleanWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
  watch: true,
})
