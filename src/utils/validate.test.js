import { isPathMatch, isExternal, validUsername, validURL, validLowerCase, validUpperCase, validAlphabets, validEmail, isEmpty } from './validate'

describe('validate.js', () => {
  describe('isPathMatch', () => {
    it('should match exact paths', () => {
      expect(isPathMatch('/test', '/test')).toBe(true)
      expect(isPathMatch('/test/path', '/test/path')).toBe(true)
      expect(isPathMatch('/test', '/other')).toBe(false)
    })

    it('should match paths with parameters', () => {
      expect(isPathMatch('/test/:id', '/test/1')).toBe(true)
      expect(isPathMatch('/test/:id/detail', '/test/1/detail')).toBe(true)
      expect(isPathMatch('/test/:id', '/test/1/detail')).toBe(false)
    })

    it('should match paths with wildcards', () => {
      expect(isPathMatch('/test/*', '/test/path')).toBe(true)
      expect(isPathMatch('/test/*/detail', '/test/1/detail')).toBe(true)
      expect(isPathMatch('/test/*', '/other/path')).toBe(false)
    })
  })

  describe('isExternal', () => {
    it('should detect external URLs', () => {
      expect(isExternal('http://example.com')).toBe(true)
      expect(isExternal('https://example.com')).toBe(true)
      expect(isExternal('mailto:test@example.com')).toBe(true)
      expect(isExternal('tel:1234567890')).toBe(true)
      expect(isExternal('/test')).toBe(false)
      expect(isExternal('./test')).toBe(false)
      expect(isExternal('../test')).toBe(false)
    })
  })

  describe('validUsername', () => {
    it('should validate usernames', () => {
      expect(validUsername('admin')).toBe(true)
      expect(validUsername('editor')).toBe(true)
      expect(validUsername('user')).toBe(false)
      expect(validUsername('test123')).toBe(false)
      expect(validUsername('')).toBe(false)
      expect(validUsername('a')).toBe(false)
      expect(validUsername('abcdefghijklmnopqrstuvwxyz')).toBe(false)
    })
  })

  describe('validURL', () => {
    it('should validate URLs', () => {
      expect(validURL('http://example.com')).toBe(true)
      expect(validURL('https://example.com')).toBe(true)
      expect(validURL('http://example.com/path')).toBe(true)
      expect(validURL('invalid-url')).toBe(false)
      expect(validURL('')).toBe(false)
    })
  })

  describe('validLowerCase', () => {
    it('should validate lowercase strings', () => {
      expect(validLowerCase('abc')).toBe(true)
      expect(validLowerCase('ABC')).toBe(false)
      expect(validLowerCase('abc123')).toBe(false)
      expect(validLowerCase('')).toBe(false)
    })
  })

  describe('validUpperCase', () => {
    it('should validate uppercase strings', () => {
      expect(validUpperCase('ABC')).toBe(true)
      expect(validUpperCase('abc')).toBe(false)
      expect(validUpperCase('ABC123')).toBe(false)
      expect(validUpperCase('')).toBe(false)
    })
  })

  describe('validAlphabets', () => {
    it('should validate alphabetic strings', () => {
      expect(validAlphabets('abc')).toBe(true)
      expect(validAlphabets('ABC')).toBe(true)
      expect(validAlphabets('abc123')).toBe(false)
      expect(validAlphabets('')).toBe(false)
    })
  })

  describe('validEmail', () => {
    it('should validate email addresses', () => {
      expect(validEmail('test@example.com')).toBe(true)
      expect(validEmail('test.name@example.com')).toBe(true)
      expect(validEmail('test@sub.example.com')).toBe(true)
      expect(validEmail('invalid-email')).toBe(false)
      expect(validEmail('test@')).toBe(false)
      expect(validEmail('@example.com')).toBe(false)
      expect(validEmail('')).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should check for empty values', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('undefined')).toBe(true)
      expect(isEmpty('test')).toBe(false)
    })
  })
})
