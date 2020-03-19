const proxy = require('../');

const autoConfigUrlLocal = 'https://bifrost.bytedance.net/proxy.pac?ip=127.0.0.1&port=8900';

async function main() {
  try {
    await proxy.setSettings({
      proxyEnable: false,
      autoConfig: false,
    });
    console.log('stop success');
  } catch (err) {
    console.log('------------------------------------');
    console.log(err);
    console.log('------------------------------------');
  }
  console.log(await proxy.getSettings());
  // 将代理恢复为修改前状态
  await proxy.reset();
  try {
    await proxy.setSettings({
      proxyEnable: false,
      autoConfig: true,
      autoConfigUrl: autoConfigUrlLocal,
    });

    console.log('start success');
  } catch (err) {
    console.log('------------------------------------');
    console.log(err);
    console.log('------------------------------------');
  }
  console.log(await proxy.getSettings());
  proxy.reset();
}
main();
