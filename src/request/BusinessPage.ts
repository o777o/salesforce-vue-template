import { request } from './index'
import type { RequestAction, RequestConfig } from './type'

const VISIALFORCE = 'BusinessCommunicationTimeNodePage'
const instance = (
  action: RequestAction,
  args?: any[],
  config?: RequestConfig
) => request(action, args, config, VISIALFORCE)

export default instance