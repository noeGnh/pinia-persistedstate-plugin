import { StateTree } from 'pinia'

export interface AsyncStorage {
	getItem: (key: string) => Promise<any>
	setItem: (key: string, value: any) => Promise<void>
	removeItem: (key: string) => Promise<void>
}

export interface StorageItem<S extends StateTree = StateTree> {
	key?: string
	storage?: Storage
	includePaths?: string[]
	excludePaths?: string[]
	serialize?: (state: S) => any
	deserialize?: (value: any) => any
}

export type PluginStorageItem = Omit<StorageItem, 'key'>

export function isStorageItem(item: any): item is StorageItem {
	return 'key' in item
}

export interface PluginOptions {
	storeKeysPrefix?: string
	persistenceDefault?: boolean
	storageItemsDefault?: PluginStorageItem[]
}

export interface StoreOptions {
	enabled?: boolean
	storageItems?: StorageItem[]
}

declare module 'pinia' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export interface DefineStoreOptionsBase<S, Store> {
		persistence?: StoreOptions
	}
}
