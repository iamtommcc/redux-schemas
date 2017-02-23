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
  karma: {
    extra: {
      singleRun: false
    },
    browsers: ['Chrome']
  }

}
