'use strict';

var _os = require('os');

var _execa = require('execa');

var _execa2 = _interopRequireDefault(_execa);

var _isGitRepository = require('is-git-repository');

var _isGitRepository2 = _interopRequireDefault(_isGitRepository);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();

var isGitAdded = function isGitAdded() {
  var altPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : cwd;

  var stdout = void 0;

  if (!(0, _isGitRepository2.default)(altPath)) {
    return false;
  }

  try {
    var cmd = '';

    if ((0, _os.platform)() === 'win32') {
      cmd = 'pushd ' + altPath + ' & git branch | findstr \\*';
    } else {
      cmd = '(cd ' + altPath + ' ; git branch | grep \\*)';
    }

    stdout = _execa2.default.shellSync(cmd).stdout;
  } catch (e) {
    return false;
  }

  var branchName = stdout.slice(2, stdout.length);

  return branchName;
};

module.exports = isGitAdded;