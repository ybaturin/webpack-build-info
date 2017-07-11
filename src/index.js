const moment = require('moment');
const git = require('git-last-commit');
const path = require('path');

class WebpackBuildInfo {
  constructor(options) {

  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, cb) => {
      for (let basename in compilation.assets) {
        let ext = path.extname(basename);
        let asset = compilation.assets[basename];
        console.log(basename);
        // switch (ext) {
        //   case '.js' :
        //     this.injectIntoJs(asset);
        //     break;
        //   case '.html' :
        //     this.injectIntoHtml(asset);
        //     break;
        //   case '.css' :
        //     this.injectIntoCss(asset);
        //     break;
        //   default:
        //     break;
        // }
      }
      cb();
    });
  }

  createBuildInfo(callback) {
    const buildTime = moment().format('D.MM.YYYY HH:mm:ss');
    git.getLastCommit((err, commit) => {
      if (err) {
        return console.error('Webpack-build-info: can\'t get last commit info', err);
      }

      callback({
        branch: commit.notes,
        lastCommitHash: commit.hash,
        buildTime,
      })
    });
  }
}

module.exports = WebpackBuildInfo;