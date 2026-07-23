import { checkPermi, checkRole } from './permission'

// 模拟 useUserStore 函数
vi.mock('@/store/modules/user', () => ({
  default: vi.fn(() => ({
    permissions: ['system:user:add', 'system:user:edit'],
    roles: ['admin', 'user']
  }))
}))

describe('permission.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkPermi', () => {
    it('should return false for invalid input', () => {
      const hasPermi1 = checkPermi(null)
      const hasPermi2 = checkPermi([])
      const hasPermi3 = checkPermi('string')
      
      expect(hasPermi1).toBe(false)
      expect(hasPermi2).toBe(false)
      expect(hasPermi3).toBe(false)
    })
  })

  describe('checkRole', () => {
    it('should return false for invalid input', () => {
      const hasRole1 = checkRole(null)
      const hasRole2 = checkRole([])
      const hasRole3 = checkRole('string')
      
      expect(hasRole1).toBe(false)
      expect(hasRole2).toBe(false)
      expect(hasRole3).toBe(false)
    })

    it('should handle empty roles', () => {
      // 模拟 useUserStore 返回空角色
      vi.mock('@/store/modules/user', () => ({
        default: vi.fn(() => ({
          roles: []
        }))
      }))
      
      const hasRole = checkRole(['admin'])
      expect(hasRole).toBe(false)
    })
  })
})
