const GitInfo = require('../lib/git-info.js');
const instance = new GitInfo();
console.log(instance.getLastCommitHash());