// 测试工具函数

/**
 * 模拟 setTimeout
 */
export const mockSetTimeout = () => {
  vi.useFakeTimers()
  return {
    advanceTime: (ms) => vi.advanceTimersByTime(ms),
    runAll: () => vi.runAllTimers(),
    restore: () => vi.useRealTimers()
  }
}

/**
 * 模拟 localStorage
 */
export const mockLocalStorage = () => {
  const mockStorage = {}
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(key => mockStorage[key]),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value.toString()
      }),
      removeItem: vi.fn(key => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => {
          delete mockStorage[key]
        })
      }),
      length: 0
    },
    writable: true
  })
  return mockStorage
}

/**
 * 模拟 sessionStorage
 */
export const mockSessionStorage = () => {
  const mockStorage = {}
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(key => mockStorage[key]),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value.toString()
      }),
      removeItem: vi.fn(key => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach(key => {
          delete mockStorage[key]
        })
      }),
      length: 0
    },
    writable: true
  })
  return mockStorage
}

/**
 * 模拟浏览器导航
 */
export const mockNavigation = () => {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:8082',
      pathname: '/',
      search: '',
      hash: '',
      reload: vi.fn(),
      assign: vi.fn(),
      replace: vi.fn()
    },
    writable: true
  })
}

/**
 * 模拟浏览器尺寸
 */
export const mockWindowSize = (width = 1920, height = 1080) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true
  })
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    writable: true
  })
  // 模拟 resize 事件
  window.dispatchEvent(new Event('resize'))
}

/**
 * 生成随机字符串
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 等待 Promise 解析
 */
export const waitFor = async (callback, options = {}) => {
  const { timeout = 1000, interval = 16 } = options
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = callback()
      if (result) {
        return result
      }
    } catch (error) {
      // 忽略错误，继续尝试
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error('waitFor timeout')
}

/**
 * 模拟网络请求
 */
export const mockApi = (api, mockResponse) => {
  return vi.spyOn(api, 'default').mockResolvedValue(mockResponse)
}

/**
 * 模拟错误网络请求
 */
export const mockApiError = (api, errorMessage = 'Network error') => {
  return vi.spyOn(api, 'default').mockRejectedValue(new Error(errorMessage))
}