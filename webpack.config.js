var path = require('path')

module.exports = {
  mode: 'none',
  entry: './build/index.js',
  output: {
    filename: 'maybeJustMaybe.js',
    path: path.resolve(__dirname, 'build', 'dist'),
    library: 'maybe-just-maybe',
    libraryTarget: 'umd'
  }
}
