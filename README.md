# proxy-settings

用于设置操作系统的局域网设置的 Node 模块（Node >= v7.6）, 支持 Windows、macOS, 后续会支持 Linux

## 安装

`npm i --save proxy-settings`

## 使用 (Promise/Async)

```js
const proxy = require('proxy-settings');

// 获取设备的所有可用 NetworkServices (macOS Only)
proxy
  .listNetworkServices()
  .then(console.log.bind(console, '获取成功: '))
  .catch(console.log.bind(console, '获取失败: '));

// 获取当前局域网设置信息，如果err非空，表示获取失败
proxy
  .getSettings()
  .then(console.log.bind(console, '获取成功: '))
  .catch(console.log.bind(console, '获取失败: '));
// output:
// { autoDetect: false,
//   autoConfig: false,
//   autoConfigUrl: '',
//   proxyEnable: true,
//   proxyServer: '127.0.0.1:8888',
//   bypassLocal: false,
//   bypass: '' }

// 自动检测设置
proxy
  .setSettings({
    autoDetect: true,
  })
  .then(console.log.bind(console, '设置成功'))
  .catch(console.log.bind(console, '设置失败: '));

// 开启并这种PAC脚本
proxy
  .setSettings({
    autoConfig: true,
    autoConfigUrl: 'http://127.0.0.1:50011',
  })
  .then(console.log.bind(console, '设置成功'))
  .catch(console.log.bind(console, '设置失败: '));

// 开启并设置统一的代理服务器，开启本地代理白名单
proxy
  .setSettings({
    proxyEnable: true,
    proxyServer: '127.0.0.1:8888',
    bypassLocal: true,
  })
  .then(console.log.bind(console, '设置成功'))
  .catch(console.log.bind(console, '设置失败: '));

// 高级设置，对http、https、ftp、socks分别设置不同的代理，并设置白名单域名前缀
proxy
  .setSettings({
    proxyEnable: true,
    proxyServer: 'http=127.0.0.1:8888;https=127.0.0.1:8889;ftp=127.0.0.1:8890;socks=127.0.0.1:8891',
    bypassLocal: false,
    bypass: 'www.test;www.abc',
  })
  .then(console.log.bind(console, '设置成功'))
  .catch(console.log.bind(console, '设置失败: '));

// 重置到修改前的设置
proxy
  .reset()
  .then(console.log.bind(console, '设置成功'))
  .catch(console.log.bind(console, '设置失败: '));
```
