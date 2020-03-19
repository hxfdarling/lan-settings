const proxy = require('../');

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
  await proxy.reset();
  try {
    await proxy.setSettings({
      autoConfig: false,
      proxyEnable: true,
      proxyServer: `127.0.0.1:8899`,
    });
    console.log('start success');
  } catch (err) {
    console.log('------------------------------------');
    console.log(err);
    console.log('------------------------------------');
  }
  console.log(await proxy.getSettings());
  await proxy.reset();
}
main();
