import { createPinia } from 'pinia'
import appStore from './app'

describe('app store', () => {
  let store
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    store = appStore(pinia)
  })

  it('should have initial state', () => {
    expect(store.sidebar).toEqual({ opened: true, withoutAnimation: false, hide: false })
    expect(store.device).toBe('desktop')
    expect(store.size).toBe('default')
  })

  it('should toggle sidebar', () => {
    store.toggleSideBar(false)
    expect(store.sidebar.opened).toBe(false)

    store.toggleSideBar(false)
    expect(store.sidebar.opened).toBe(true)
  })

  it('should close sidebar', () => {
    store.closeSideBar({ withoutAnimation: true })
    expect(store.sidebar.opened).toBe(false)
    expect(store.sidebar.withoutAnimation).toBe(true)
  })

  it('should toggle sidebar hide', () => {
    store.toggleSideBarHide(true)
    expect(store.sidebar.hide).toBe(true)

    store.toggleSideBarHide(false)
    expect(store.sidebar.hide).toBe(false)
  })

  it('should toggle device', () => {
    store.toggleDevice('mobile')
    expect(store.device).toBe('mobile')

    store.toggleDevice('desktop')
    expect(store.device).toBe('desktop')
  })

  it('should set size', () => {
    store.setSize('small')
    expect(store.size).toBe('small')

    store.setSize('large')
    expect(store.size).toBe('large')
  })
})
