# pinia-persistence-plugin ![npm (scoped)](https://img.shields.io/npm/v/pinia-persistence-plugin)

Handle Pinia state persistence easily.

## ✨ Features

- Support multiple storages.
- Can be configured globally and in every Pinia store.
- Support async storages like [localForage](https://www.npmjs.com/package/localforage).
- Storages, store paths and serialization method can be customized.

## Installation

Install with your favorite package manager:

```sh
# npm
npm i pinia-persistence-plugin
# yarn
yarn add pinia-persistence-plugin
# pnpm
pnpm add pinia-persistence-plugin
```

## Usage

Add this plugin to your Pinia instance:

```ts
import { createPinia } from 'pinia'
import { persistencePlugin } from 'pinia-persistence-plugin'

const pinia = createPinia()
pinia.use(persistencePlugin())
```

The persistence is enabled by default for all pinia stores and the default storage is `localStorage`.

## Configuration

### Plugin Options

```ts
persistencePlugin({
 // plugin options goes here
 storeKeysPrefix: 'test',
 persistenceDefault: false,
 storageItemsDefault: [
  {
   storage: sessionStorage,
  },
 ],
 debug: true,
})
```

- `storeKeysPrefix?: string`: Defaults to `undefined`. Add prefix to stores keys.

- `persistenceDefault?: boolean`: Defaults to `true`. Whether to persist all stores by default.

- `storageItemsDefault?: PluginStorageItem[]`: Defaults to `localStorage`. List of storages.

- `assertStorage?: (storage: Storage) => void | Promise<void>`: Perform a write and delete operation by default. To ensure `storages` is available.

- `debug?: boolean`: Defaults to `false`. Display errors and warnings in console.

#### PluginStorageItem

- `storage?: Storage`: Where to store persisted state

- `includePaths?: string[]`: Defaults to `[]`. An array of any paths to partially persist the state

- `excludePaths?: string[]`: Defaults to `[]`. An array of any paths to exclude

- `serializer?: Serializer`: Object containing serialize and deserialize methods

  - `serialize?: (state: S): any`: Defaults to `JSON.stringify`. This method will be called right before `storage.setItem`.

  - `deserialize?: (value: any): any`: Defaults to `JSON.parse`. This method will be called right after `storage.getItem`.

### Store Options

```ts
defineStore(
 'store',
 () => {
  const count = ref(0)
  const increment = () => count.value++
  return {
   count,
   increment,
  }
 },
 {
  persistence: {
   // store options goes here
   enabled: true,
   storageItems: [
    {
     key: 'sample',
     storage: sessionStorage,
     includePaths: ['count'],
    },
   ],
  },
 }
)
```

- `enabled?: boolean`: Enable persistence for the store
- `storageItems?: StorageItem[]`: List of storages.
- `beforeHydrate?: (oldState: S) => void`: Perform some tasks before patching the store

#### StorageItem

- `key?: string`: Defaults to `store.$id`. The persisted store state key.
  And the same properties as [PluginStorageItem](#pluginstorageitem)

#### Storage

- `getItem: (key: string) => any | Promise<any>`

- `setItem: (key: string, value: any) => void | Promise<void>`

- `removeItem: (key: string) => void | Promise<void>`

## Some examples of use

### js-cookie

```ts
import { defineStore } from 'pinia'

import Cookies from 'js-cookie'

defineStore('example', {
 // ...
 persistence: {
  enabled: true,
  storageItems: [
   {
    storage: {
     getItem: (key: string) => {
      return Cookies.get(key)
     },
     setItem: (key: string, value: any) => {
      Cookies.set(key, value)
     },
     removeItem: (key: string) => {
      Cookies.remove(key)
     },
    },
   },
  ],
 },
})
```

### localForage

```ts
import { defineStore } from 'pinia'

import localforage from 'localforage'

localforage.config({
 driver: [localforage.INDEXEDDB],
 name: 'Test IndexedDB',
 storeName: 'store',
})

defineStore('example', {
 // ...
 persistence: {
  enabled: true,
  storageItems: [
   {
    storage: {
     getItem: async (key: string) => {
      return await localforage.getItem(key)
     },
     setItem: async (key: string, value: any) => {
      await localforage.setItem(key, value)
     },
     removeItem: async (key: string) => {
      await localforage.removeItem(key)
     },
    },
   },
  ],
 },
})
```

### Custom serialize method

```ts
import { defineStore } from 'pinia'

import stringify from 'json-stringify-safe'

defineStore('example', {
 // ...
 persistence: {
  enabled: true,
  storageItems: [
   {
    storage: localStorage,
    serializer: {
     serialize: (value: any) => stringify(value),
    },
   },
  ],
 },
})
```

### localStorage with SecureLS encryption

```ts
import { defineStore } from 'pinia'

import SecureLS from 'secure-ls'

var ls = new SecureLS({
 encodingType: 'aes',
 isCompression: false,
})

defineStore('example', {
 // ...
 persistence: {
  enabled: true,
  storageItems: [
   {
    key: 'encrypted_data',
    storage: {
     getItem: (key: string) => {
      try {
       return ls.get(key)
      } catch (error) {
       console.error(error)
      }
     },
     setItem: (key: string, value: any) => {
      try {
       ls.set(key, value)
      } catch (error) {
       console.error(error)
      }
     },
     removeItem: (key: string) => {
      try {
       ls.remove(key)
      } catch (error) {
       console.error(error)
      }
     },
    },
   },
  ],
 },
})
```

> This project is inspired by [`vuex-persistedstate`](https://github.com/robinvdvleuten/vuex-persistedstate) and [pinia-plugin-persist](https://github.com/Seb-L/pinia-plugin-persist).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/noeGnh/pinia-persistence-plugin/releases).

## License

This project is under [MIT](https://github.com/noeGnh/pinia-persistence-plugin/LICENSE) license.
