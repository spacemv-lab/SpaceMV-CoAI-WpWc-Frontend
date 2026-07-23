import { defineStore } from 'pinia'

const useMediaProductStore = defineStore(
  'mediaProduct',
  {
    state: () => ({
      productId: null,
      platformId: null,
      accountId: null,
      channelId: null
    }),
    actions: {
      setProductId(productId) {
        this.productId = productId
      },
      setPlatformId(platformId) {
        this.platformId = platformId
      },
      setAccountId(accountId) {
        this.accountId = accountId
      },
      setChannelId(channelId) {
        this.channelId = channelId
      },
      setProductInfo(productId, platformId, accountId, channelId) {
        this.productId = productId
        this.platformId = platformId
        this.accountId = accountId
        this.channelId = channelId
      },
      clearProductInfo() {
        this.productId = null
        this.platformId = null
        this.accountId = null
        this.channelId = null
      }
    }
  }
)

export default useMediaProductStore
