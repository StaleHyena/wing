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
};
