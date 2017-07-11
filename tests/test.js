const WebpackBuildInfo = require('../lib/index.js');
const instance = new WebpackBuildInfo();

instance.createBuildInfo((data) => console.log(data));