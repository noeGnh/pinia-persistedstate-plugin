import { createPinia } from 'pinia'
import { persistencePlugin } from 'pinia-persistence-plugin'

export default createPinia().use(
  persistencePlugin({
    storeKeysPrefix: 'test',
    persistenceDefault: false,
    storageItemsDefault: [
      {
        storage: sessionStorage,
      },
    ],
    debug: true,
  })
)
