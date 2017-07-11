const moment = require('moment');
const git = require('git-last-commit');
const path = require('path');
moment.locale('ru');

class WebpackBuildInfo {
  constructor(options = {}) {
    this.entryName = options.entryName ? options.entryName + '.js' : '';
    this.disabled = options.disabled || false;
  }

  apply(compiler) {
    if (!this.entryName || this.disabled) {
      return;
    }

    compiler.plugin('emit', (compilation, done) => {
      let found = false;
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
    const buildTime = moment().format('HH:mm:ss D-MMM-YYYY ');
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
      window.__buildInfo = ${JSON.stringify(buildInfo)};
      window.showBuild = function() {
        console.log('%c--------------------------------------------------------------', 'color: grey');
        console.log('%cBuildTime: ' + '%c' + window.__buildInfo.buildTime, 'color: #444444', 'color: black');
        console.log('%cBranch: ' + '%c' + window.__buildInfo.branch, 'color: #444444', 'color: black');
        console.log('%cLastCommitHash: ' + '%c' + window.__buildInfo.lastCommitHash, 'color: #444444', 'color: black');
        console.log('%c--------------------------------------------------------------', 'color: grey');
      }
      window.showBuild();
    })();`
  }
}

module.exports = WebpackBuildInfo;