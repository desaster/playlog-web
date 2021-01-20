const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    index: 'playlog.html',
    port: 5042,
    contentBase: path.join(__dirname, 'assets')
  },
});
