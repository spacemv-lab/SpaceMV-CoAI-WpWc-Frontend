import router from './index'
import { constantRoutes } from './index'

// 模拟依赖
vi.mock('@/store', () => ({
  default: {
    use: vi.fn(() => ({
      state: {
        user: {
          roles: ['admin']
        },
        permission: {
          routes: []
        }
      },
      dispatch: vi.fn()
    }))
  }
}))

vi.mock('@/utils/permission', () => ({
  checkRole: vi.fn(() => true)
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => 'test-token')
}))

vi.mock('nprogress', () => ({
  start: vi.fn(),
  done: vi.fn()
}))

vi.mock('@/layout', () => ({
  default: {
    name: 'Layout'
  }
}))

vi.mock('@/views/login', () => ({
  default: {
    name: 'Login'
  }
}))

vi.mock('@/views/redirect/index.vue', () => ({
  default: {
    name: 'Redirect'
  }
}))

describe('router/index.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export constantRoutes', () => {
    expect(constantRoutes).toBeDefined()
    expect(Array.isArray(constantRoutes)).toBe(true)
    expect(constantRoutes.length).toBeGreaterThan(0)
  })

  it('should have router instance', () => {
    expect(router).toBeDefined()
    expect(typeof router).toBe('object')
  })

  it('should have router methods', () => {
    expect(typeof router.push).toBe('function')
    expect(typeof router.replace).toBe('function')
    expect(typeof router.go).toBe('function')
    expect(typeof router.back).toBe('function')
    expect(typeof router.forward).toBe('function')
    expect(typeof router.getRoutes).toBe('function')
  })

  it('should have login route', () => {
    const loginRoute = constantRoutes.find(route => route.path === '/login')
    expect(loginRoute).toBeDefined()
    expect(loginRoute.hidden).toBe(true)
  })

  it('should have redirect route', () => {
    const redirectRoute = constantRoutes.find(route => route.path === '/redirect')
    expect(redirectRoute).toBeDefined()
    expect(redirectRoute.hidden).toBe(true)
  })
})
