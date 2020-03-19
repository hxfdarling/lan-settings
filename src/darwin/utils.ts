import { exec } from '../utils';

function parseInfo(data: string) {
  return data
    .split('\n')
    .map(i => i.split(': '))
    .reduce((info, item) => {
      if (item.length < 2) {
        return info;
      }
      const [key, value] = item.map(i => i.trim().replace(/\s+/g, '-'));
      info[key] = value;
      return info;
    }, {} as any);
}

function callNetworkSetup(type: string, networkservice: string, ...args: string[]) {
  const command = `networksetup -${type} ${networkservice ? `"${networkservice}"` : ''} ${args
    .map(item => `"${item}"`)
    .join(' ')}`;
  return exec(command);
}

async function getSettingItems(arg: string, keys, networkservice: string) {
  const info = parseInfo(await callNetworkSetup(arg, networkservice));
  if (!keys || keys.length === 0) {
    return info[Object.keys(info)[0]];
  }
  if (typeof keys === 'string') {
    return info[keys];
  }

  if (keys.length === 1) {
    return info[keys[0]];
  }
  return keys.map((key: string) => info[key]);
}

export { parseInfo, callNetworkSetup, getSettingItems };
