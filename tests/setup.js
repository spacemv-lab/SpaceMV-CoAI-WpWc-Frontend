// 测试环境设置
import '@testing-library/jest-dom'
import { createPinia } from 'pinia'
import { config } from '@vue/test-utils'

// 全局 Pinia 实例
const pinia = createPinia()

// 配置 Vue Test Utils
config.global.plugins = [pinia]

// 模拟 Element Plus 组件
config.global.mocks = {
  $message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  $notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}

// 全局工具函数
global.createTestPinia = () => createPinia()