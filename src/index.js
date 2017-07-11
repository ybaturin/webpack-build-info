class WebpackBuildInfo {
  constructor(options) {

  }

  apply(compiler) {
    compiler.plugin('done', function() {
      console.log('Hello World!');
    });
  }
}

module.exports = WebpackBuildInfo;