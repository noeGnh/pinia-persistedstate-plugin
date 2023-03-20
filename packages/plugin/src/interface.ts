import 'pinia'

export interface StorageItem {
	key?: string
	storage?: Storage
	paths?: string[]
}

export type PluginStorageItem = Omit<StorageItem, 'key'>

export function isStorageItem(item: any): item is StorageItem {
	return 'key' in item
}

export interface PluginOptions {
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
