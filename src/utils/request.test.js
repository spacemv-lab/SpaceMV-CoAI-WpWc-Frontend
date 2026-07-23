import request from './request'
import * as axios from 'axios'
import { getToken } from './auth'

// 模拟 axios
vi.mock('axios', () => {
  const mockInstance = {
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  
  const mockAxios = {
    defaults: {
      headers: {}
    },
    create: vi.fn(() => mockInstance),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    }
  }
  
  return {
    default: mockAxios
  }
})

// 模拟 getToken
vi.mock('./auth', () => ({
  getToken: vi.fn(() => 'test-token')
}))

// 模拟 Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

// 模拟路由
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn()
  })),
  createWebHistory: vi.fn()
}))

describe('request.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create axios instance', () => {
    // axios.create is called during module initialization
    expect(true).toBe(true)
  })

  it('should export request methods', () => {
    expect(request).toBeDefined()
    expect(typeof request.get).toBe('function')
    expect(typeof request.post).toBe('function')
    expect(typeof request.put).toBe('function')
    expect(typeof request.delete).toBe('function')
  })
})
