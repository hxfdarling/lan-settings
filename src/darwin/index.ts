import { exec } from '../utils';
import { parseInfo, callNetworkSetup, getSettingItems } from './utils';
import { Settings } from '../..';

const proxyTypesMap = {
  // 网页代理
  http: 'webproxy',
  // 安全网页代理
  https: 'securewebproxy',
};

const disableProxyTypesMap = {
  // FTP 代理
  ftp: 'ftpproxy',
  // Socks5 代理
  socks: 'socksfirewallproxy',
  // 流代理
  stream: 'streamingproxy',
  // Gopher 代理
  gopher: 'gopherproxy',
};

const proxyTypes = Object.assign({}, proxyTypesMap, disableProxyTypesMap);

let initialed = false;
let defaultWiFiSettings: Settings;
let defaultEthernetSettings: Settings;
let defaultUsbSettings: Settings;
let networkServices: any;

function multiClose(types, networkservice) {
  return Promise.all(
    Object.keys(types).map(async type => {
      await callNetworkSetup(`set${types[type]}state`, networkservice, 'off');
    })
  );
}
export async function init() {
  if (!networkServices) {
    networkServices = await listNetworkServices();
  }
  let wifi: Settings;
  if (networkServices.includes('Wi-Fi')) {
    wifi = await getSettings('Wi-Fi');
  }
  let ether: Settings;
  if (networkServices.includes('Ethernet')) {
    ether = await getSettings('Ethernet');
  }
  let usb: Settings;
  let usbName;
  networkServices.forEach(name => {
    if (name.includes('USB')) {
      usbName = name;
    }
  });
  if (usbName) {
    usb = await getSettings(usbName);
  }
  if (initialed) {
    return;
  }
  initialed = true;
  defaultWiFiSettings = wifi;
  defaultEthernetSettings = ether;
  defaultUsbSettings = usb;
}

export async function listNetworkServices() {
  return (await exec('networksetup -listallnetworkservices'))
    .split('\n')
    .filter(i => i.trim() && !i.includes('*'))
    .filter(i => !['Bluetooth PAN', 'Thunderbolt Bridge', 'iPhone USB'].includes(i));
}

export async function getSettings(networkservice = 'All') {
  if (!networkServices) {
    networkServices = await listNetworkServices();
  }
  if (networkservice === 'All') {
    // 插上网线时, Wi-Fi 不生效, 直接获取 Ethernet 配置
    if (networkServices.includes('Ethernet')) {
      return getSettings('Ethernet');
    }
    return getSettings('Wi-Fi');
  }
  const settings: Settings = {} as Settings;
  try {
    settings.autoDetect = (await getSettingItems('getproxyautodiscovery', [], networkservice)) === 'On';
  } catch (e) {
    console.error(e);
  }
  try {
    const autoProxy = await getSettingItems('getautoproxyurl', ['URL', 'Enabled'], networkservice);
    settings.autoConfig = autoProxy[1] === 'Yes';
    const autoConfigUrl = autoProxy[0].trim();
    if (autoConfigUrl && autoConfigUrl !== '(null)') {
      settings.autoConfigUrl = autoConfigUrl;
    } else {
      settings.autoConfigUrl = '';
    }
  } catch (e) {
    console.error(e);
  }

  const bypass = (await callNetworkSetup('getproxybypassdomains', networkservice)).trim();
  if (bypass !== `There aren't any bypass domains set on ${networkservice}.`) {
    settings.bypass = bypass.replace(/\n/g, ';');
  }

  settings.proxies = {} as any;
  settings.proxyEnable = false;
  settings.proxyServer = '';
  await Promise.all(
    Object.keys(proxyTypes).map(async type => {
      const info = parseInfo(await callNetworkSetup(`get${proxyTypes[type]}`, '', networkservice));
      if (info.Enabled === 'Yes') {
        const server = `${info.Server}:${info.Port}`;
        settings.proxies[`${type}ProxyEnable`] = true;
        settings.proxies[`${type}ProxyServer`] = server;
        settings.proxyEnable = true;
        settings.proxyServer += `${type}=${server};`;
      } else {
        settings.proxies[`${type}ProxyEnable`] = false;
      }
    })
  );

  return settings;
}

export async function setSettings(settings: Settings, networkservice = 'All') {
  if (!(defaultWiFiSettings || defaultEthernetSettings || defaultUsbSettings)) {
    await init();
  }
  if (networkservice === 'All') {
    return Promise.all(networkServices.map(setSettings.bind(null, settings)));
  }

  if ('autoDetect' in settings) {
    await callNetworkSetup('setproxyautodiscovery', networkservice, settings.autoDetect ? 'on' : 'off');
  }
  if (settings.autoConfig) {
    await callNetworkSetup('setautoproxystate', networkservice, 'on');
    if (settings.autoConfigUrl.trim()) {
      await callNetworkSetup('setautoproxyurl', networkservice, settings.autoConfigUrl);
    }
  } else {
    await callNetworkSetup('setautoproxystate', networkservice, 'off');
  }
  if ('bypass' in settings && settings.bypass.trim()) {
    await callNetworkSetup('setproxybypassdomains', networkservice, ...settings.bypass.split(';'));
  }
  if (settings.proxyEnable) {
    // 启用
    if (settings.proxyServer.includes('=')) {
      // 分别设置
      await multiClose(proxyTypes, networkservice);
      await Promise.all(
        settings.proxyServer
          .split(';')
          .filter(s => s.trim())
          .reduce((servers, item) => {
            const [key, value] = item.split('=').map(s => s.trim());
            servers.push([key].concat(value.split(':')));
            return servers;
          }, [])
          .map(async item => {
            const [type, address, port] = item;
            await callNetworkSetup(`set${proxyTypes[type]}`, networkservice, address, port);
            await callNetworkSetup(`set${proxyTypes[type]}state`, networkservice, 'On');
          })
      );
    } else {
      // 统一设置
      const [address, port] = settings.proxyServer.split(':');
      await Promise.all(
        Object.keys(proxyTypesMap).map(async type => {
          await callNetworkSetup(`set${proxyTypesMap[type]}`, networkservice, address, port);
          await callNetworkSetup(`set${proxyTypesMap[type]}state`, networkservice, 'on');
        })
      );
      await multiClose(disableProxyTypesMap, networkservice);
    }
  } else if (settings.proxyEnable === false) {
    await Promise.all(
      Object.keys(proxyTypesMap).map(type => callNetworkSetup(`set${proxyTypesMap[type]}state`, networkservice, 'off'))
    );
  }
}

export async function reset(networkservice = 'All') {
  if (!(defaultWiFiSettings || defaultEthernetSettings || defaultUsbSettings)) {
    await init();
  }
  if (networkservice === 'All') {
    return Promise.all(networkServices.map(reset));
  }
  let defaultSettings;
  switch (networkservice) {
    case 'Wi-Fi':
      defaultSettings = defaultWiFiSettings;
      break;
    case 'Ethernet':
      defaultSettings = defaultEthernetSettings;
      break;
    default: {
      if (networkservice.includes('USB')) {
        defaultSettings = defaultUsbSettings;
      }
    }
  }
  if (defaultSettings) {
    return setSettings(defaultSettings, networkservice);
  }
}
