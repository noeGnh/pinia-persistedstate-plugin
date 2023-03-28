/* eslint-disable @typescript-eslint/no-unused-vars */
import { PiniaPluginContext, StateTree } from 'pinia'

export interface Storage {
  getItem: (key: string) => any | Promise<any>
  setItem: (key: string, value: any) => void | Promise<void>
  removeItem: (key: string) => void | Promise<void>
}

export interface Serializer<S extends StateTree = StateTree> {
  serialize?: (state: S) => any
  deserialize?: (value: any) => any
}

export interface StorageItem {
  key?: string
  storage?: Storage
  includePaths?: string[]
  excludePaths?: string[]
  serializer?: Serializer
}

export type PluginStorageItem = Omit<StorageItem, 'key'>

export function isStorageItem(item: any): item is StorageItem {
  return 'key' in item
}

export interface PluginOptions {
  storeKeysPrefix?: string
  persistenceDefault?: boolean
  storageItemsDefault?: PluginStorageItem[]
  assertStorage?: (storage: Storage) => void | Promise<void>
  ensureAsyncStorageUpdateOrder?: boolean
  debug?: boolean
}

export interface StoreOptions<S extends StateTree = StateTree> {
  enabled?: boolean
  storageItems?: StorageItem[]
  beforeHydrate?: (oldState: S) => void
}

export interface UpdateAsyncStorageTask {
  id: string
  storageItem: StorageItem
  store: PiniaPluginContext['store']
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persistence?: StoreOptions
  }

  export interface PiniaCustomProperties<
    Id extends string = string,
    S extends StateTree = StateTree,
    G /* extends GettersTree<S> */ = _GettersTree<S>,
    A /* extends ActionsTree */ = _ActionsTree
  > {
    $persistence: {
      pending: boolean
    }
  }
}
