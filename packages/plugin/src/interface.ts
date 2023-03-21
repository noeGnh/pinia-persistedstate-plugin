/* eslint-disable @typescript-eslint/no-unused-vars */
import { StateTree } from 'pinia'

export interface AsyncStorage {
	getItem: (key: string) => Promise<any>
	setItem: (key: string, value: any) => Promise<void>
	removeItem: (key: string) => Promise<void>
}

export interface Serializer<S extends StateTree = StateTree> {
	serialize?: (state: S) => any
	deserialize?: (value: any) => any
}

export interface StorageItem {
	key?: string
	storage?: Storage | AsyncStorage
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
	assertStorage?: (storage: Storage | AsyncStorage) => void | Promise<void>
	debug?: boolean
}

export interface StoreOptions<S extends StateTree = StateTree> {
	enabled?: boolean
	storageItems?: StorageItem[]
	beforeHydrate?: (oldState: S) => void
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
