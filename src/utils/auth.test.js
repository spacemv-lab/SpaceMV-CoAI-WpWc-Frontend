import { getToken, setToken, removeToken, getExpiresIn, setExpiresIn, removeExpiresIn } from './auth'
import Cookies from 'js-cookie'

// 模拟Cookies库
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}))

describe('auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getToken', () => {
    it('should return token from cookies', () => {
      const mockToken = 'test-token'
      Cookies.get.mockReturnValue(mockToken)
      
      const result = getToken()
      
      expect(Cookies.get).toHaveBeenCalledWith('Admin-Token')
      expect(result).toBe(mockToken)
    })

    it('should return undefined if no token exists', () => {
      Cookies.get.mockReturnValue(undefined)
      
      const result = getToken()
      
      expect(Cookies.get).toHaveBeenCalledWith('Admin-Token')
      expect(result).toBeUndefined()
    })
  })

  describe('setToken', () => {
    it('should set token to cookies', () => {
      const mockToken = 'test-token'
      const mockReturnValue = 'cookie-result'
      Cookies.set.mockReturnValue(mockReturnValue)
      
      const result = setToken(mockToken)
      
      expect(Cookies.set).toHaveBeenCalledWith('Admin-Token', mockToken)
      expect(result).toBe(mockReturnValue)
    })
  })

  describe('removeToken', () => {
    it('should remove token from cookies', () => {
      const mockReturnValue = 'cookie-result'
      Cookies.remove.mockReturnValue(mockReturnValue)
      
      const result = removeToken()
      
      expect(Cookies.remove).toHaveBeenCalledWith('Admin-Token')
      expect(result).toBe(mockReturnValue)
    })
  })

  describe('getExpiresIn', () => {
    it('should return expiresIn from cookies', () => {
      const mockExpiresIn = '3600'
      Cookies.get.mockReturnValue(mockExpiresIn)
      
      const result = getExpiresIn()
      
      expect(Cookies.get).toHaveBeenCalledWith('Admin-Expires-In')
      expect(result).toBe(mockExpiresIn)
    })

    it('should return -1 if no expiresIn exists', () => {
      Cookies.get.mockReturnValue(undefined)
      
      const result = getExpiresIn()
      
      expect(Cookies.get).toHaveBeenCalledWith('Admin-Expires-In')
      expect(result).toBe(-1)
    })
  })

  describe('setExpiresIn', () => {
    it('should set expiresIn to cookies', () => {
      const mockTime = '3600'
      const mockReturnValue = 'cookie-result'
      Cookies.set.mockReturnValue(mockReturnValue)
      
      const result = setExpiresIn(mockTime)
      
      expect(Cookies.set).toHaveBeenCalledWith('Admin-Expires-In', mockTime)
      expect(result).toBe(mockReturnValue)
    })
  })

  describe('removeExpiresIn', () => {
    it('should remove expiresIn from cookies', () => {
      const mockReturnValue = 'cookie-result'
      Cookies.remove.mockReturnValue(mockReturnValue)
      
      const result = removeExpiresIn()
      
      expect(Cookies.remove).toHaveBeenCalledWith('Admin-Expires-In')
      expect(result).toBe(mockReturnValue)
    })
  })
})