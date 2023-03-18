export interface StorageItem {
	key?: string
	storage?: Storage
	paths?: string[]
}

export interface Options {
	persistByDefault: boolean
	storages?: StorageItem[]
}
