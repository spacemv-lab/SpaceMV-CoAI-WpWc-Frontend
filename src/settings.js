const normalizeUrl = (value, fallback = '') => (value || fallback).replace(/\/+$/, '')

export default {
  /**
   * 网页标题
   */
  title: import.meta.env.VITE_APP_TITLE,

  /**
   * 内外网环境配置
   */
  env: import.meta.env.VITE_ENV,

  /**
   * PC端访问地址
   */
  pcWeb: normalizeUrl(import.meta.env.VITE_PC_WEB_URL, 'https://pc.example.com'),


  /**
   * 移动端访问地址
   */
  mobileWeb: normalizeUrl(import.meta.env.VITE_MOBILE_WEB_URL, 'https://mobile.example.com'),

  /**
   * 文档地址
   */
  docsUrl: normalizeUrl(import.meta.env.VITE_DOCS_URL, 'https://docs.example.com'),

  /**
   * 图表制作平台地址
   */
  chartStudioUrl: normalizeUrl(import.meta.env.VITE_CHART_STUDIO_URL, 'https://charts.example.com'),

  /**
   * 静态资源访问地址
   */
  staticAssetBaseUrl: normalizeUrl(import.meta.env.VITE_STATIC_ASSET_BASE_URL, ''),

  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: 'theme-dark',

  /**
   * 是否系统布局配置
   */
  showSettings: true,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: false,
  
  /**
   * 显示页签图标
   */
  tagsIcon: false,

  /**
   * 是否固定头部
   */
  fixedHeader: false,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,

  /**
   * 是否显示底部版权
   */
  footerVisible: false,

  /**
   * 底部版权文本内容
   */
  footerContent: `Copyright © 2020-${new Date().getFullYear()} SpaceMV.com All Rights Reserved.`
}

