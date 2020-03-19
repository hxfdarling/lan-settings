import { setSettings, getSettings, reset, init } from '../darwin';
describe('mac', () => {
  beforeAll(async () => {
    await init();
    console.log(await getSettings());
  });
  afterAll(async () => {
    await reset();
  });
  it('get-settings', async () => {
    const data = await getSettings();
    expect(data).toHaveProperty('autoConfig');
  });
  it('set-settings pac', async () => {
    const config = {
      autoDetect: false,
      autoConfig: true,
      autoConfigUrl: 'https://bifrost.bytedance.net/proxy.pac?ip=127.0.0.1&port=8899',
      proxies: {
        ftpProxyEnable: false,
        httpProxyEnable: false,
        socksProxyEnable: false,
        streamProxyEnable: false,
        httpsProxyEnable: false,
        gopherProxyEnable: false,
      },
      proxyEnable: false,
      proxyServer: '',
    };
    await setSettings(config);
    const newData = await getSettings();
    expect(newData).toEqual(config);
  });
  it('set-settings proxy', async () => {
    const config = {
      autoDetect: false,
      autoConfig: false,
      proxies: {
        ftpProxyEnable: false,
        httpProxyEnable: true,
        socksProxyEnable: false,
        streamProxyEnable: false,
        httpsProxyEnable: false,
        gopherProxyEnable: false,
      },
      proxyEnable: true,
      proxyServer: 'http=127.0.0.1:8899;https=127.0.0.1:8899;',
    };
    await setSettings(config);
    const newData = await getSettings();
    console.log('newData', newData);
    expect(newData.proxyServer).toEqual(config.proxyServer);
  });
});
