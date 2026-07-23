import { createPinia } from 'pinia'
import userStore from './user'
import { getToken, removeToken } from '@/utils/auth'

// 模拟依赖
vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(),
  removeToken: vi.fn()
}))

vi.mock('@/api/login', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getInfo: vi.fn()
}))

vi.mock('@/api/system/user', () => ({
  getList: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessageBox: {
    confirm: vi.fn(() => Promise.resolve())
  }
}))

describe('user store', () => {
  let store
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    store = userStore(pinia)
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    expect(store.token).toBeUndefined()
    expect(store.id).toBe('')
    expect(store.name).toBe('')
    expect(store.nickName).toBe('')
    expect(store.avatar).toBe('')
    expect(store.roles).toEqual([])
    expect(store.permissions).toEqual([])
  })
})
