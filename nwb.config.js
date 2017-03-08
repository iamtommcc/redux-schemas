module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: false
  },
  webpack: {
    extra: {
      devtool: 'inline-source-map'
    }
  },

}
