import request from '@/utils/request'

// TXWX 地图平台 API
// 通过 vite 代理 /map-api 转发到部署环境配置的地图服务（见 vite.config.js）
// 鉴权复用当前项目 IAM token（与 TXWX 同一套），request.js 自动注入 Authorization: Bearer
const MAP_BASE = '/map-api'

/**
 * 获取工程（地图项目）列表
 * @param {Object} params { page, pageSize, ownerId }
 * @returns { items: [{ id, name, description, datasetCount, createdAt, updatedAt }], total }
 */
export function getProjectList(params = {}) {
  const { page = 1, pageSize = 100, ownerId } = params
  const query = { skip: (page - 1) * pageSize, take: pageSize }
  if (ownerId) query.ownerId = ownerId
  return request({
    url: '/projects',
    method: 'get',
    baseURL: MAP_BASE,
    params: query
  })
}

/**
 * 凭分享 token 免鉴权获取工程只读地图视图（预览/渲染端用）
 * @param {string} token share token
 * @returns { project: { id, name }, state: { ... } }
 */
export function getPublicShare(token) {
  return request({
    url: `/public/share/${token}`,
    method: 'get',
    baseURL: MAP_BASE
  })
}

/**
 * 幂等获取项目的嵌入 token（后端原生 get-or-create，label='embed'）
 * 一个项目对应一个稳定 token，重复调用返回同一 token，不会刷出新 token
 * 对应后端：POST /api/projects/:id/embed-token（commit 6682b6c）
 * @returns { id, token, url, projectId, label, createdAt, revokedAt, expiresAt, viewCount }
 */
export function getOrCreateEmbedToken(projectId) {
  return request({
    url: `/projects/${projectId}/embed-token`,
    method: 'post',
    baseURL: MAP_BASE
  })
}

/**
 * 拼接工程预览图（白板快照）的代理 URL，供 <img src> 直接引用（卡片缩略图等）
 * 匿名接口（@SkipAuth），返回二进制 JPEG；owner 未"发布预览"时返回 404
 * 对应后端：GET /api/projects/:id/whiteboard/image（commit 480c8e8）
 */
export function getMapPreviewImageUrl(projectId) {
  return `${MAP_BASE}/projects/${projectId}/whiteboard/image`
}

/**
 * 拉取工程预览图二进制（用于再上传到公众号图库 / coai 文件服务）
 * 走 plain fetch（匿名接口，无需 Bearer；且需原始 blob，不走 axios 解包）
 * @param {string} projectId
 * @returns {Promise<Blob>}
 * @throws 非 200 时抛错（404 = owner 未发布预览图），调用方据此中止插入
 */
export async function fetchMapPreviewImage(projectId) {
  const res = await fetch(getMapPreviewImageUrl(projectId))
  if (!res.ok) throw new Error(`preview image ${res.status}`)
  return res.blob()
}
