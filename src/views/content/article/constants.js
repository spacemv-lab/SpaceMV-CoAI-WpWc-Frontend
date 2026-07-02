export const ARTICLE_STATUS = {
  DRAFT: { label: '草稿', type: 'info' },
  REVIEWING: { label: '审核中', type: 'warning' },
  PUBLISHED: { label: '已发布', type: 'success' },
  OFFLINE: { label: '已下架', type: 'danger' }
}

export const VISIBILITY = {
  PUBLIC: { label: '公开', type: 'success' },
  LOGIN: { label: '登录可见', type: 'warning' },
  PAID: { label: '付费可见', type: 'danger' }
}

export const PUBLISH_STATUS = {
  PENDING: { label: '待发布', type: 'info' },
  PROCESSING: { label: '发布中', type: 'warning' },
  SUCCESS: { label: '成功', type: 'success' },
  FAILED: { label: '失败', type: 'danger' },
  CANCELLED: { label: '已取消', type: 'info' }
}

export const TARGET_CODE_MAP = {
  SITE_WENDAO: { label: 'SpaceMV问道', type: 'success', icon: 'Link' },
  WECHAT_OFFICIAL_ACCOUNT: { label: '微信公众号', type: 'primary', icon: 'ChatDotSquare' },
  XIAOHONGSHU: { label: '小红书', type: 'warning', icon: 'Camera' },
  ZHISHU_XINGQIU: { label: '知识星球', type: 'info', icon: 'Star' }
}

export const MOCK_CHARTS = [
  { slug: 'china-pmi-trend', title: '中国PMI趋势', region: '中国', type: '折线图' },
  { slug: 'china-export-trend', title: '中国出口趋势', region: '中国', type: '柱状图' },
  { slug: 'us-cpi-core', title: '美国CPI与核心CPI', region: '美国', type: '折线图' },
  { slug: 'global-pmi-compare', title: '全球PMI对比', region: '全球', type: '折线图' }
]
