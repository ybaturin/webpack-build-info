'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment');
var git = require('git-last-commit');
var path = require('path');
var fs = require('fs');
moment.locale('ru');

var WebpackBuildInfo = function () {
  function WebpackBuildInfo() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebpackBuildInfo);

    this.entryName = options.entryName;
    this.disabled = options.disabled || false;
    this.PACKAGE_JSON_PATH = this.PACKAGE_JSON_PATH || './package.json';
    this.version = null;

    this._readVersion();
  }

  _createClass(WebpackBuildInfo, [{
    key: '_readVersion',
    value: function _readVersion() {
      var packageFile = JSON.parse(fs.readFileSync(path.resolve(this.PACKAGE_JSON_PATH), 'utf8'));
      this.version = packageFile.version;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      if (this.disabled) {
        return;
      }

      compiler.plugin('emit', function (compilation, done) {
        var found = false;

        var _loop = function _loop(basename) {
          var ext = path.extname(basename);
          var asset = compilation.assets[basename];
          if (!_this.entryName && ext === 'js' || _this.entryName && basename.indexOf(_this.entryName) !== -1) {
            found = true;
            console.log('\n adding build info to ' + basename + '...');
            _this.createCodeInject(function (code) {
              var newSource = code + asset.source();
              asset.source = function () {
                return newSource;
              };
              console.log('done.\n');
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

      var buildTime = moment().format('HH:mm:ss D-MMM-YYYY ');
      git.getLastCommit(function (err, commit) {
        if (err) {
          cb('');
          return console.error('Webpack-build-info: can\'t get last commit info', err);
        }

        var buildInfo = {
          branch: commit.notes,
          lastCommitHash: commit.hash,
          version: _this2.version,
          buildTime: buildTime
        };
        var result = _this2._getInjectString(buildInfo);
        cb(result);
      });
    }
  }, {
    key: '_getInjectString',
    value: function _getInjectString(buildInfo) {
      return '(function(){\n      window.__buildInfo = ' + JSON.stringify(buildInfo) + ';\n      window.showBuild = function() {\n        console.log(\'%c--------------------------------------------------------------\', \'color: grey\');\n        console.log(\'%cBuildTime: \' + \'%c\' + window.__buildInfo.buildTime, \'color: #444444\', \'color: black\');\n        console.log(\'%cVersion: \' + \'%c\' + window.__buildInfo.version, \'color: #444444\', \'color: black\');\n        console.log(\'%cBranch: \' + \'%c\' + window.__buildInfo.branch, \'color: #444444\', \'color: black\');\n        console.log(\'%cLastCommitHash: \' + \'%c\' + window.__buildInfo.lastCommitHash, \'color: #444444\', \'color: black\');\n        console.log(\'%c--------------------------------------------------------------\', \'color: grey\');\n      }\n      window.showBuild();\n    })();';
    }
  }]);

  return WebpackBuildInfo;
}();

module.exports = WebpackBuildInfo;