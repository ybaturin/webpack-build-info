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

      compiler.plugin('emit', function (compilation, cb) {
        var _loop = function _loop(basename) {
          var asset = compilation.assets[basename];
          if (basename === _this.entryName) {
            _this.createBuildInfoInject(function (code) {
              var newSource = code + asset.source;
              asset.source = function () {
                return newSource;
              };

              cb();
            });
          } else {
            cb();
          }
        };

        for (var basename in compilation.assets) {
          _loop(basename);
        }
        cb();
      });
    }
  }, {
    key: 'createBuildInfoInject',
    value: function createBuildInfoInject(cb) {
      var buildTime = moment().format('D.MM.YYYY HH:mm:ss');
      git.getLastCommit(function (err, commit) {
        if (err) {
          return console.error('Webpack-build-info: can\'t get last commit info', err);
        }

        cb({
          branch: commit.notes,
          lastCommitHash: commit.hash,
          buildTime: buildTime
        });
      });
    }
  }, {
    key: '_getInjectString',
    value: function _getInjectString(buildInfo) {
      '(function(){\n      window.buildInfo = ' + buildInfo + ';\n      console.log(buildInfo);\n    })();';
    }
  }]);

  return WebpackBuildInfo;
}();

module.exports = WebpackBuildInfo;