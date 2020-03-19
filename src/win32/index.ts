import regedit from 'regedit';
import { parseSettings, toRegBinary } from './util';
import { Settings } from '../..';

const SETTINGS_PATH = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Connections';
const SETTINGS_KEY = 'DefaultConnectionSettings';

let defaultConnectionSettings: Settings;

function setSettingValue(value) {
  return new Promise((resolve, reject) => {
    const valueToPut = {};
    valueToPut[SETTINGS_PATH] = {};
    valueToPut[SETTINGS_PATH][SETTINGS_KEY] = {
      type: 'REG_BINARY',
      value: toRegBinary(value),
    };
    regedit.putValue(valueToPut, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
}

export async function init() {
  defaultConnectionSettings = await getSettings();
}
export async function getSettings() {
  return new Promise((resolve, reject) => {
    regedit.list(SETTINGS_PATH, (err, result) => {
      if (err) {
        return reject(err);
      }
      result = result && result[SETTINGS_PATH];
      result = result && result.values;
      result = result && result[SETTINGS_KEY];
      resolve(parseSettings(result && result.value));
    });
  });
}
export const listNetworkServices = async () => {
  throw new Error('listNetworkServices is unsupported on win32 platform!');
};

export const setSettings = async settings => {
  if (!defaultConnectionSettings) {
    await init();
  }
  return setSettingValue(settings);
};
export const reset = async () => {
  if (!defaultConnectionSettings) {
    return;
  }
  return setSettingValue(defaultConnectionSettings);
};
