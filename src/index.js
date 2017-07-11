const moment = require('moment');
const git = require('git-last-commit');
const path = require('path');

class WebpackBuildInfo {
  constructor(options = {}) {
    this.entryName = options.entryName ? options.entryName + '.js' : '';
  }

  apply(compiler) {
    if (!this.entryName) {
      return;
    }

    compiler.plugin('emit', (compilation, cb) => {
      for (let basename in compilation.assets) {
        let asset = compilation.assets[basename];
        if (basename === this.entryName) {
          console.log(`...adding inject to ${this.entryName}...`);
          this.createBuildInfoInject((code) => {
            console.log(`...code prev ${asset.source()}...`);
            const newSource = code + asset.source();
            asset.source = () => newSource;
            console.log(`...code new ${asset.source()}...`);
            cb();
          })
        } else {
          cb();
        }
      }
      cb();
    });
  }

  createBuildInfoInject(cb) {
    const buildTime = moment().format('D.MM.YYYY HH:mm:ss');
    git.getLastCommit((err, commit) => {
      if (err) {
        return console.error('Webpack-build-info: can\'t get last commit info', err);
      }

      cb({
        branch: commit.notes,
        lastCommitHash: commit.hash,
        buildTime,
      })
    });
  }

  _getInjectString(buildInfo) {
    `(function(){
      window.buildInfo = ${buildInfo};
      console.log(buildInfo);
    })();`
  }
}

module.exports = WebpackBuildInfo;