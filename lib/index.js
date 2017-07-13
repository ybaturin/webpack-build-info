'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment-timezone');
var git = require('git-last-commit');
var path = require('path');
var fs = require('fs');
var getGitBranchName = require('git-branch-name');

moment.locale('ru');

var WebpackBuildInfo = function () {
  function WebpackBuildInfo() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebpackBuildInfo);

    this.entryName = options.entryName;
    this.disabled = options.disabled || false;
    this.packageJsonPath = options.packageJsonPath || './package.json';
    this.buildRevisionPath = options.buildRevisionPath || './build/buildRevision.txt';
    this.needBuildRevision = options.needBuildRevision || false;
    this.version = null;

    this._readVersion();
  }

  _createClass(WebpackBuildInfo, [{
    key: '_readVersion',
    value: function _readVersion() {
      var packageFile = JSON.parse(fs.readFileSync(path.resolve(this.packageJsonPath), 'utf8'));
      this.version = packageFile.version;
      if (this.needBuildRevision) {
        var revision = this._incrementBuildRevision();
        this.version += '.' + revision;
      }
    }
  }, {
    key: '_incrementBuildRevision',
    value: function _incrementBuildRevision() {
      try {
        var filePath = path.resolve(this.buildRevisionPath);
        var currentRevision = void 0;
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
      var buildTime = moment().tz('Europe/Samara').format('HH:mm:ss D-MMM-YYYY');
      git.getLastCommit(function (err, commit) {
        if (err) {
          cb('');
          return console.error('Webpack-build-info: can\'t get last commit info', err);
        }

        getGitBranchName(process.cwd(), function (err, branchName) {
          if (err) {
            cb('');
            return console.error('Webpack-build-info: can\'t get branch name', err);
          }

          var buildInfo = {
            branch: branchName,
            lastCommitHash: commit.hash,
            version: this.version,
            buildTime: buildTime
          };
          var result = this._getInjectString(buildInfo);
          cb(result);
        });
      });
    }
  }, {
    key: '_getInjectString',
    value: function _getInjectString(buildInfo) {
      return '(function(){\n      window.__buildInfo = ' + JSON.stringify(buildInfo) + ';\n      window.showBuild = function() {\n        console.log(\'%c--------------------------------------------------------------\', \'color: grey\');\n        console.log(\'%cBuildTime: \' + \'%c\' + window.__buildInfo.buildTime + \' (\u0421\u0430\u043C\u0430\u0440\u0430)\', \'color: #444444\', \'color: black\');\n        console.log(\'%cVersion: \' + \'%c\' + window.__buildInfo.version, \'color: #444444\', \'color: black\');\n        console.log(\'%cBranch: \' + \'%c\' + window.__buildInfo.branch, \'color: #444444\', \'color: black\');\n        console.log(\'%cLastCommitHash: \' + \'%c\' + window.__buildInfo.lastCommitHash, \'color: #444444\', \'color: black\');\n        console.log(\'%c--------------------------------------------------------------\', \'color: grey\');\n      }\n      window.showBuild();\n    })();';
    }
  }]);

  return WebpackBuildInfo;
}();

module.exports = WebpackBuildInfo;