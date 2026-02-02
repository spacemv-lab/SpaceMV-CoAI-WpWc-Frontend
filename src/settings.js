/** 
 * Copyright (c) 2018 RuoYi | Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
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
  // pcWeb: import.meta.env.VITE_ENV === 'intranet' ? '' : '',
  pcWeb: 'http://spacemv.com',

  /**
   * 移动端访问地址
   */
  // mobileWeb: import.meta.env.VITE_ENV === 'intranet' ? '' : '',
  mobileWeb: 'http://spacemv.com',

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
  footerContent: ''
}

