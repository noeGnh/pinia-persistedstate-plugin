import { createPinia } from 'pinia'
import { persistedStatePlugin } from '@arkn/pinia-persistedstate-plugin'

export default createPinia().use(persistedStatePlugin())
