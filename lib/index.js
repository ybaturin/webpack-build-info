'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gitInfo = require('./git-info');

var _gitInfo2 = _interopRequireDefault(_gitInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require('moment-timezone');
var path = require('path');
var fs = require('fs');

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
      this.version = this._getFullVersion(packageFile.version);
      if (this.needBuildRevision) {
        this._incrementBuildRevision();
      }
    }
  }, {
    key: '_incrementBuildRevision',
    value: function _incrementBuildRevision() {
      try {
        var filePath = path.resolve(this.buildRevisionPath);
        var currentRevision = 0;
        if (fs.existsSync(filePath)) {
          var revisionTxt = fs.readFileSync(filePath, 'utf8');
          // старая версия, когда хранился только номер ревизии
          if (revisionTxt.indexOf('.') === -1) {
            currentRevision = parseInt(revisionTxt);
          } else {
            var lastVersionArr = revisionTxt.split('.');
            var lastVersionWithoutRevision = revisionTxt.slice(0, lastVersionArr.length - 1).join('.');

            if (this.version === lastVersionWithoutRevision) {
              currentRevision = parseInt(lastVersionArr[3]);
            }
          }
        }
        currentRevision += 1;
        this.version = this.version + '.' + currentRevision;
        fs.writeFileSync(filePath, this.version, 'utf8');
      } catch (error) {
        return 0;
      }
    }
  }, {
    key: '_getFullVersion',
    value: function _getFullVersion(version) {
      var versionArr = version.split('.');
      if (versionArr.length < 3) {
        for (var i = versionArr.length; i < 3; i++) {
          versionArr.push(0);
        }
      }

      return versionArr.join('.');
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
        for (var basename in compilation.assets) {
          var ext = basename.split('.').pop();
          var asset = compilation.assets[basename];
          if (ext === 'js' && (!_this.entryName || _this.entryName && basename.indexOf(_this.entryName) !== -1)) {
            (function () {
              found = true;
              console.log('\n adding build info to ' + basename + '...');

              var code = _this.createCodeInject();
              var newSource = code + asset.source();
              asset.source = function () {
                return newSource;
              };

              console.log('done.\n');
              done();
            })();
          }
        }

        if (!found) {
          done();
        }
      });
    }
  }, {
    key: 'createCodeInject',
    value: function createCodeInject() {
      var buildTime = moment().tz('Europe/Samara').format('HH:mm:ss D-MMM-YYYY');
      var gitInfoInst = new _gitInfo2.default();
      var branch = gitInfoInst.getBranchName();
      var lastCommitHash = gitInfoInst.getLastCommitHash();

      var buildInfo = {
        version: this.version,
        branch: branch,
        lastCommitHash: lastCommitHash,
        buildTime: buildTime
      };
      return this._getInjectString(buildInfo);
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