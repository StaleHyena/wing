const path = require('path');

module.exports = {
  entry: {
    client: './client/sketch.js',
    admin: './admin/sketch.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'libs'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
  externals: {
    p5: 'p5',
  }
};
