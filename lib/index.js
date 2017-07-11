'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');
var git = require('git-last-commit');

var WebpackBuildInfo = function () {
  function WebpackBuildInfo(options) {
    _classCallCheck(this, WebpackBuildInfo);
  }

  _createClass(WebpackBuildInfo, [{
    key: 'apply',
    value: function apply(compiler) {
      // compiler.plugin('done', function() {
      //   console.log('Hello World!');
      // });
      this.createBuildInfo(function (info) {
        return console.log(info);
      });
    }
  }, {
    key: 'createBuildInfo',
    value: function createBuildInfo(callback) {
      var buildTime = moment().format('D.MM.YYYY HH:mm:ss');
      git.getLastCommit(function (err, commit) {
        if (err) {
          return console.error('Webpack-build-info: can\'t get last commit info', err);
        }

        callback({
          git: commit,
          branch: commit.branch,
          lastCommitHash: commit.hash,
          buildTime: buildTime
        });
      });
    }
  }]);

  return WebpackBuildInfo;
}();

module.exports = WebpackBuildInfo;