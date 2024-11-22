import { sendMessage } from './message'
import baseConfig from '@/config/config'

import type {
  RequestAction,
  RequestConfig,
  RequestResolve
} from './type'

const getData = <T>(
  action: RequestAction,
  args: any[] = [],
  config: RequestConfig = { escape: false }
): Promise<RequestResolve<T>> => {
  return new Promise((resolve) => {
    if (action === 'getGlobalData') {
      resolve({ result: window.parent.getGlobalData() })
    } else {
      window.parent.Controller[action](
        ...args,
        (result: any, event: any) => {
          resolve({ result, event })
        },
        config
      )
    }
  })
}

/**
 * 封装request模块
 * @param {string} action // 对应调用的controller的方法名称
 * @param {array} args // 入参
 * @param {object} config // 请求配置
 * @param {string} visialforce // 对应不同的Visialforce Page, 可在requestEnum配置
 * @returns 
 */
export const request = async <T>(
  action: RequestAction,
  args: any[] = [],
  config: RequestConfig = { escape: false },
  visialforce: string
): Promise<T> => {
  let res: any
  if (baseConfig.isDevelopment) {
    res = await sendMessage<T>(action, args, config, visialforce)
  } else {
    res = await getData<T>(action, args, config)
  }

  console.log(res)
  const { result, event } = res
  if (action === 'getGlobalData') {
    return result
  } else {
    if (event.status) {
      try {
        const { code, data, msg } = JSON.parse(result)
        if (code === 200) {
          return data
        } else {
          ElMessage.error(msg)
          return Promise.reject(msg)
        }
      } catch (error) {
        console.warn(error)
        return Promise.resolve(result)
      }
    } else {
      ElMessage.error('请求失败，请联系系统管理员')
      return Promise.reject(event.message)
    }
  }
}