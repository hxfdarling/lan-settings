export declare function init(): Promise<void>;
export declare function listNetworkServices(): Promise<string[]>;
export declare function getSettings(networkservice?: string): any;
export declare function setSettings(settings: Settings, networkservice?: string): Promise<any>;
export declare function reset(networkservice?: string): Promise<any>;
export interface Settings {
  autoDetect?: boolean;
  autoConfig?: boolean;
  autoConfigUrl?: string;
  proxies?: {
    ftpProxyEnable: boolean;
    httpProxyEnable: boolean;
    httpProxyServer?: string;
    httpsProxyEnable: boolean;
    httpsProxyServer?: string;
    socksProxyEnable: boolean;
    streamProxyEnable: boolean;
    gopherProxyEnable: boolean;
  };
  proxyEnable?: boolean;
  proxyServer?: string;
  bypass?: string;
}
