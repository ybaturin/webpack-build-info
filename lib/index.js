'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');
var git = require('git-last-commit');
var path = require('path');

var WebpackBuildInfo = function () {
  function WebpackBuildInfo() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebpackBuildInfo);

    this.entryName = options.entryName ? options.entryName + '.js' : '';
  }

  _createClass(WebpackBuildInfo, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      if (!this.entryName) {
        return;
      }

      compiler.plugin('emit', function (compilation, done) {
        var found = false;

        var _loop = function _loop(basename) {
          var asset = compilation.assets[basename];
          if (basename === _this.entryName) {
            found = true;
            console.log('\n adding build info to ' + _this.entryName + '...');
            _this.createCodeInject(function (code) {
              var newSource = code + asset.source();
              asset.source = function () {
                return newSource;
              };
              console.log('done\n');
              done();
            });
          }
        };

        for (var basename in compilation.assets) {
          _loop(basename);
        }

        if (!found) {
          done();
        }
      });
    }
  }, {
    key: 'createCodeInject',
    value: function createCodeInject(cb) {
      var _this2 = this;

      var buildTime = moment().format('D.MM.YYYY HH:mm:ss');
      git.getLastCommit(function (err, commit) {
        if (err) {
          cb('');
          return console.error('Webpack-build-info: can\'t get last commit info', err);
        }

        var buildInfo = {
          branch: commit.notes,
          lastCommitHash: commit.hash,
          buildTime: buildTime
        };
        var result = _this2._getInjectString(buildInfo);
        cb(result);
      });
    }
  }, {
    key: '_getInjectString',
    value: function _getInjectString(buildInfo) {
      return '(function(){\n      window.__buildInfo = ' + JSON.stringify(buildInfo) + ';\n      window.showBuild = function() {\n        console.log(\'#############################################\');\n        console.log(\'BuildTime: \', window.__buildInfo.buildTime);\n        console.log(\'Branch: \', window.__buildInfo.branch);\n        console.log(\'LastCommitHash: \', window.__buildInfo.lastCommitHash);\n        console.log(\'#############################################\');\n      }\n      window.showBuild();\n    })();';
    }
  }]);

  return WebpackBuildInfo;
}();

module.exports = WebpackBuildInfo;