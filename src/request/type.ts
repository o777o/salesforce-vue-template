// 配置参考 https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_js_remoting_configuring_request.htm
export type RequestConfig = {
  escape?: boolean
  buffer?: boolean
  timeout?: number
}

export type RequestAction = 'getGlobalData' | string

export type RequestResolve<T> = {
  result: T;
  event?: any;
}

export type MessageCallbacks = {
  [key: string]: (value: any) => void;
}

export type requestEnum = {
  [key: string]: {
    window: Window | null;
    promise: Promise<any> | null;
    resolve: (() => void) | null;
  }
}

export type MessageData<T> = {
  action: string;
  result: T;
  event: any;
  Id: keyof MessageCallbacks;
  name: keyof requestEnum;
}

interface Controller {
  [key: string]: (...args: any[]) => void
}

declare global {
  interface Window {
    Controller: Controller;
    getGlobalData: Function;
  }
}