import { platform } from 'os';
import execa from 'execa';
import isGit from 'is-git-repository';

const cwd = process.cwd();

class GitInfo {
  constructor(path = cwd) {
    this.path = path;
  }

  getBranchName() {
    let stdout;

    if (!isGit(this.path)) {
      return false;
    }

    try {
      let cmd = '';

      if (platform() === 'win32') {
        cmd = `pushd ${this.path} & git branch | findstr \\*`;
      } else {
        cmd = `(cd ${this.path} ; git branch | grep \\*)`;
      }

      stdout = execa.shellSync(cmd).stdout;
    } catch (e) {
      return false;
    }

    const branchName = stdout.slice(2, stdout.length);

    return branchName;
  }

  getLastCommitHash() {
    if (!isGit(this.path)) {
      return false;
    }

    try {
      let cmd = '';

      if (platform() === 'win32') {
        cmd = `pushd ${this.path} & git log --pretty=format:'%h' -n 1`;
      } else {
        cmd = `(cd ${this.path} ; git log --pretty=format:'%h' -n 1)`;
      }

      return execa.shellSync(cmd).stdout;
    } catch (e) {
      return false;
    }
  }
}

module.exports = GitInfo;