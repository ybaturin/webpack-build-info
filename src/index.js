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
          console.log(`\n adding inject to ${this.entryName}...`);
          this.createCodeInject((code) => {
            console.log(code);
            const newSource = code + asset.source();
            asset.source = () => newSource;

            console.log('done\n');
            cb();
          })
        } else {
          cb();
        }
      }
      cb();
    });
  }

  createCodeInject(cb) {
    const buildTime = moment().format('D.MM.YYYY HH:mm:ss');
    git.getLastCommit((err, commit) => {
      if (err) {
        return console.error('Webpack-build-info: can\'t get last commit info', err);
      }

      const buildInfo = {
        branch: commit.notes,
        lastCommitHash: commit.hash,
        buildTime,
      };
      const result = this._getInjectString(buildInfo);
      cb(result);
    });
  }

  _getInjectString(buildInfo) {
    return `(function(){
      window.__buildInfo = ${buildInfo};
      window.showBuild = function() {
        console.log('#############################################');
        console.log(BuildTime: window.__buildInfo.buildTime);
        console.log(Branch: window.__buildInfo.branch);
        console.log(LastCommitHash: window.__buildInfo.lastCommitHash);
        console.log('#############################################');
      }
    })();`
  }
}

module.exports = WebpackBuildInfo;