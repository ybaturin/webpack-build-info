const moment = require('moment');
const git = require('git-last-commit');

class WebpackBuildInfo {
  constructor(options) {

  }

  apply(compiler) {
    // compiler.plugin('done', function() {
    //   console.log('Hello World!');
    // });
    this.createBuildInfo((info) => console.log(info));
  }

  createBuildInfo(callback) {
    const buildTime = moment().format('D.MM.YYYY HH:mm:ss');
    git.getLastCommit((err, commit) => {
      if (err) {
        return console.error('Webpack-build-info: can\'t get last commit info', err);
      }

      callback({
        git: commit,
        branch: commit.branch,
        lastCommitHash: commit.hash,
        buildTime,
      })
    });
  }
}

module.exports = WebpackBuildInfo;