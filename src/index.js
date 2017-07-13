const moment = require('moment-timezone');
const git = require('git-last-commit');
const path = require('path');
const fs = require('fs');
const getGitBranchName = require('git-branch-name');

moment.locale('ru');

class WebpackBuildInfo {
  constructor(options = {}) {
    this.entryName = options.entryName;
    this.disabled = options.disabled || false;
    this.packageJsonPath = options.packageJsonPath || './package.json';
    this.buildRevisionPath = options.buildRevisionPath || './build/buildRevision.txt';
    this.needBuildRevision = options.needBuildRevision || false;
    this.version = null;

    this._readVersion();
  }

  _readVersion() {
    let packageFile = JSON.parse(
      fs.readFileSync(path.resolve(this.packageJsonPath), 'utf8')
    );
    this.version = packageFile.version;
    if (this.needBuildRevision) {
      const revision = this._incrementBuildRevision();
      this.version += `.${revision}`;
    }
  }

  _incrementBuildRevision() {
    try {
      const filePath = path.resolve(this.buildRevisionPath);
      let currentRevision;
      if (fs.existsSync(filePath)) {
        currentRevision = parseInt(fs.readFileSync(filePath, 'utf8'), 10) + 1;
      } else {
        currentRevision = 1;
      }
      fs.writeFileSync(filePath, currentRevision, 'utf8');

      return currentRevision;
    } catch (error) {
      return 0;
    }
  }

  apply(compiler) {
    if (this.disabled) {
      return;
    }

    compiler.plugin('emit', (compilation, done) => {
      let found = false;
      for (let basename in compilation.assets) {
        const ext = path.extname(basename);
        let asset = compilation.assets[basename];
        if ((!this.entryName && ext === 'js') || (this.entryName && basename.indexOf(this.entryName) !== -1)) {
          found = true;
          console.log(`\n adding build info to ${basename}...`);
          this.createCodeInject((code) => {
            const newSource = code + asset.source();
            asset.source = () => newSource;
            console.log('done.\n');
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
    const buildTime = moment().tz('Europe/Samara').format('HH:mm:ss D-MMM-YYYY');
    git.getLastCommit((err, commit) => {
      if (err) {
        cb('');
        return console.error('Webpack-build-info: can\'t get last commit info', err);
      }

      getGitBranchName(__dirname, function(err, branchName) {
        if (err) {
          cb('');
          return console.error('Webpack-build-info: can\'t get branch name', err);
        }

        const buildInfo = {
          branch: branchName,
          lastCommitHash: commit.hash,
          version: this.version,
          buildTime,
        };
        const result = this._getInjectString(buildInfo);
        cb(result);
      });

    });
  }

  _getInjectString(buildInfo) {
    return `(function(){
      window.__buildInfo = ${JSON.stringify(buildInfo)};
      window.showBuild = function() {
        console.log('%c--------------------------------------------------------------', 'color: grey');
        console.log('%cBuildTime: ' + '%c' + window.__buildInfo.buildTime + ' (Самара)', 'color: #444444', 'color: black');
        console.log('%cVersion: ' + '%c' + window.__buildInfo.version, 'color: #444444', 'color: black');
        console.log('%cBranch: ' + '%c' + window.__buildInfo.branch, 'color: #444444', 'color: black');
        console.log('%cLastCommitHash: ' + '%c' + window.__buildInfo.lastCommitHash, 'color: #444444', 'color: black');
        console.log('%c--------------------------------------------------------------', 'color: grey');
      }
      window.showBuild();
    })();`
  }
}

module.exports = WebpackBuildInfo;