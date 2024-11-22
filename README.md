# salesforce-vue-template

一套在 Salesforce 平台上开发基于 Vue.js 应用的模板项目

## Introduction

借助Visualforce Page、Static Resource，开发环境通过PostMessage API、生产环境通过iframe实现数据交互，快速搭建 Salesforce 应用的前端开发环境。

## 准备工作

- env文件中配置salesforce的visualforce page根路径

```
# .env.development
VITE_BASE_URL='https://salesforceInstance.sandbox.vf.force.com/'
```

- Salesforce中创建Visualforce Page，并配置好相关的组件和事件

```html
<apex:page
  docType="html-5.0"
  applyHtmlTag="false"
  applyBodyTag="false"
  showHeader="false"
  sidebar="false"
  standardStylesheets="false"
  controller="YourController"
  showQuickActionVfHeader="false"
>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <style>
        * {
          margin: 0;
          line-height: 0;
        }

        #iframe {
          width: 100%;
          border: none;
          height: 100vh;
        }
      </style>
    </head>

    <script>
      window.Controller = YourController

      // 获取全局数据
      function getGlobalData() {
        return {
          // example:
          $Label: {
            // someLabel: '{!$Label.someLabel}'
          }
          // someGlobalData: '{!someGlobalData}'
        }
      }

      window.onload = function () {
        window.opener?.postMessage(
          {
            action: 'TargetWindowLoaded',
            name: 'YourVfPageName'
          },
          '*'
        )

        const iframe = document.createElement('iframe')
        iframe.id = 'iframe'
        iframe.src = `{!$Resource.yourStaticResource}/index.html`
        document.body.appendChild(iframe)
      }

      // 监听消息事件
      window.addEventListener('message', function (e) {
        if (e.data && e.data.action) {
          console.log(e.data)
          const { action, args, config, Id } = e.data
          if (action === 'getGlobalData') {
            e.source.postMessage(
              {
                action,
                result: getGlobalData(),
                Id
              },
              e.origin
            )
          } else {
            Controller[action](
              ...args,
              (result, event) => {
                console.log(result, event)
                // 返回信息
                e.source.postMessage(
                  {
                    action,
                    result,
                    event,
                    Id
                  },
                  e.origin
                )
              },
              config
            )
          }
        }
      })
    </script>
  </html>
</apex:page>
```

- 配置vue应用的request
  一个visualforce page的controller对应一个request

```js
// BusinessPage.ts
import { request } from './index'
import type { RequestAction, RequestConfig } from './type'

const VISIALFORCE = 'YourVfPageName' // 对应visualforce page中TargetWindowLoaded的name
const instance = (
  action: RequestAction,
  args?: any[],
  config?: RequestConfig
) => request(action, args, config, VISIALFORCE)

export default instance
```

## 开始使用

```vue
<script setup lang="ts">
import request from '@/request/BusinessPage'
request('ControllerMethod', [...args])
</script>
```

参考[example](https://github.com/o777o/salesforce-vue-template/src/request/message.ts)

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### 发布生产环境

```sh
pnpm build
```

进入打包后的/dist目录，全选压缩，上传至Salesforce的静态资源，资源名对应visialforce page中的yourStaticResource
注意：vite.config.ts的base需要配置为相对路径: './'
