const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
import GitInfo from './git-info';
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
    this.version = this._getFullVersion(packageFile.version);
    if (this.needBuildRevision) {
      this._incrementBuildRevision();
    }
  }

  _incrementBuildRevision() {
    try {
      const filePath = path.resolve(this.buildRevisionPath);
      let currentRevision = 0;
      if (fs.existsSync(filePath)) {
        const revisionTxt = fs.readFileSync(filePath, 'utf8');
        // старая версия, когда хранился только номер ревизии
        if (revisionTxt.indexOf('.') === -1) {
          currentRevision = parseInt(revisionTxt);
        } else {
          const lastVersionArr = revisionTxt.split('.');
          const lastVersionWithoutRevision = revisionTxt.slice(0, lastVersionArr.length - 1).join('.');

          if (this.version === lastVersionWithoutRevision) {
            currentRevision = parseInt(lastVersionArr[3]);
          }
        }
      }
      currentRevision += 1;
      this.version = `${this.version}.${currentRevision}`;
      fs.writeFileSync(filePath, this.version, 'utf8');
    } catch (error) {
      return 0;
    }
  }

  _getFullVersion(version) {
    const versionArr = version.split('.');
    if (versionArr.length < 3) {
      for(let i = versionArr.length; i < 3; i++) {
        versionArr.push(0);
      }
    }

    return versionArr.join('.');
  }

  apply(compiler) {
    if (this.disabled) {
      return;
    }

    compiler.plugin('emit', (compilation, done) => {
      let found = false;
      for (let basename in compilation.assets) {
        const ext = basename.split('.').pop();
        let asset = compilation.assets[basename];
        if (ext === 'js' && (!this.entryName || (this.entryName && basename.indexOf(this.entryName) !== -1))) {
          found = true;
          console.log(`\n adding build info to ${basename}...`);

          const code = this.createCodeInject();
          const newSource = code + asset.source();
          asset.source = () => newSource;

          console.log('done.\n');
          done();
        }
      }

      if (!found) {
        done();
      }
    });
  }

  createCodeInject() {
    const buildTime = moment().tz('Europe/Samara').format('HH:mm:ss D-MMM-YYYY');
    const gitInfoInst = new GitInfo();
    const branch = gitInfoInst.getBranchName();
    const lastCommitHash = gitInfoInst.getLastCommitHash();

    const buildInfo = {
      version: this.version,
      branch,
      lastCommitHash,
      buildTime,
    };
    return this._getInjectString(buildInfo);
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