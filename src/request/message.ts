import baseConfig from '@/config/config'
import { nanoid } from 'nanoid'

import type {
  RequestAction,
  RequestConfig,
  RequestResolve,
  MessageCallbacks,
  requestEnum,
  MessageData
} from './type'

// 用于存储待处理的消息的回调函数
const messageCallbacks: MessageCallbacks = {}

// 监听消息事件
window.addEventListener('message', function (event) {
  const data: MessageData<any> = event.data
  // 检查是否是期待的消息
  if (data && data.action) {
    console.log('message', event.data)
    if (data.action === 'TargetWindowLoaded') {
      const resolve = requestEnum[data.name]?.resolve!
      resolve()
      return
    }
    if (messageCallbacks[data.Id]) {
      messageCallbacks[data.Id](data)
    }
  }
})

const requestEnum: requestEnum = {}
const getTargetWindow = (visialforce: string): Promise<void> => {
  const vfPage = requestEnum[visialforce]
  if (vfPage) {
    return vfPage.promise!
  } else {
    requestEnum[visialforce] = {
      window: null,
      promise: null,
      resolve: null
    }

    requestEnum[visialforce].promise = new Promise<void>(resolve => {
      // 发送消息到其他标签页
      const url = new URL(`${baseConfig.baseUrl}apex/${visialforce}`)

      let searchParam: string
      const { search, hash } = window.location
      if (hash) {
        searchParam = hash.split('?')[1]
      } else {
        searchParam = search.split('?')[1]
      }
      const href = url.href + (searchParam ? `?${searchParam}` : '')

      const targetWindow = window.open(href, visialforce)
      requestEnum[visialforce].window = targetWindow
      requestEnum[visialforce].resolve = resolve
    })

    return requestEnum[visialforce].promise!
  }
}

// 封装postMessage的方法
export const sendMessage = <T>(
  action: RequestAction,
  args: any[],
  config: RequestConfig,
  visialforce: string
): Promise<RequestResolve<T>> => {
  return new Promise(resolve => {
    const Id = nanoid()
    // 存储回调函数
    messageCallbacks[Id] = resolve

    getTargetWindow(visialforce)!.then(() => {
      const { window } = requestEnum[visialforce]
      // 发送消息
      window!.postMessage(
        {
          action: action,
          Id,
          args,
          config
        },
        '*'
      )
    })
  })
}
