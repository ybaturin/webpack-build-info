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

    compiler.plugin('emit', (compilation, done) => {
      let found = fase;
      for (let basename in compilation.assets) {
        let asset = compilation.assets[basename];
        if (basename === this.entryName) {
          found = true;
          console.log(`\n adding build info to ${this.entryName}...`);
          this.createCodeInject((code) => {
            const newSource = code + asset.source();
            asset.source = () => newSource;
            console.log('done\n');
            done();
          })
        }
      }

      if (!found) {
        done();
      }
    });
  }

  createCodeInject(cb) {
    const buildTime = moment().format('D.MM.YYYY HH:mm:ss');
    git.getLastCommit((err, commit) => {
      if (err) {
        cb('');
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
      window.showBuild();
    })();`
  }
}

module.exports = WebpackBuildInfo;