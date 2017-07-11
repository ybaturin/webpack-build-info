# webpack-build-info
<br>
Добавляет к одному из entry информацию о сборке в виде BuildTime, BranchName, LastCommitHash.
Которая будет выведена в консоль браузера и добавлена в метод window.showBuild();
<br>
Для подключения к Webpack 2 использовать в webback.config.js:

```js
const WebpackBuildInfo = require('webpack-build-info');
...
plugins: [
...
  new WebpackBuildInfo({
    entryName: 'your_entry_name',
  }),
...
]
```
