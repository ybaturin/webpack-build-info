'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _os = require('os');

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _isGitRepository = require('is-git-repository');

var _isGitRepository2 = _interopRequireDefault(_isGitRepository);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cwd = process.cwd();

var GitInfo = function () {
  function GitInfo() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : cwd;

    _classCallCheck(this, GitInfo);

    this.path = path;
  }

  _createClass(GitInfo, [{
    key: 'getBranchName',
    value: function getBranchName() {
      var stdout = void 0;

      if (!(0, _isGitRepository2.default)(this.path)) {
        return false;
      }

      try {
        var cmd = '';

        if ((0, _os.platform)() === 'win32') {
          cmd = 'pushd ' + this.path + ' & git branch | findstr \\*';
        } else {
          cmd = '(cd ' + this.path + ' ; git branch | grep \\*)';
        }

        stdout = _execa2.default.shellSync(cmd).stdout;
      } catch (e) {
        return false;
      }

      var branchName = stdout.slice(2, stdout.length);

      return branchName;
    }
  }, {
    key: 'getLastCommitHash',
    value: function getLastCommitHash() {
      if (!(0, _isGitRepository2.default)(this.path)) {
        return false;
      }

      try {
        var cmd = '';

        if ((0, _os.platform)() === 'win32') {
          cmd = 'pushd ' + this.path + ' & git log --pretty=format:\'%h\' -n 1';
        } else {
          cmd = '(cd ' + this.path + ' ; git log --pretty=format:\'%h\' -n 1)';
        }

        return _execa2.default.shellSync(cmd).stdout;
      } catch (e) {
        return false;
      }
    }
  }]);

  return GitInfo;
}();

module.exports = GitInfo;