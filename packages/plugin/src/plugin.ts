import type { PiniaPluginContext, PiniaPlugin } from 'pinia'
import type { PluginOptions, PluginStorageItem, StorageItem } from './interface'
import { isStorageItem } from './interface'

export function persistedStatePlugin(
	pluginOptions?: PluginOptions
): PiniaPlugin {
	const getStoreKey = (
		storageItem: PluginStorageItem | StorageItem,
		defaultKey: string
	) => {
		return (
			(pluginOptions?.storeKeysPrefix || '') +
			((isStorageItem(storageItem) ? storageItem?.key : defaultKey) ||
				defaultKey)
		)
	}

	const updateStorage = (
		storageItem: PluginStorageItem | StorageItem,
		store: PiniaPluginContext['store'],
		key: string
	) => {
		const storage = storageItem.storage || localStorage
		const serialize = storageItem.serialize || JSON.stringify
		let state = store.$state

		const hasExcludedPaths =
			Array.isArray(storageItem.excludePaths) && storageItem.excludePaths.length

		if (
			Array.isArray(storageItem.includePaths) &&
			storageItem.includePaths.length
		) {
			state = storageItem.includePaths.reduce((finalObj, path) => {
				if (
					!hasExcludedPaths ||
					(hasExcludedPaths && !storageItem.excludePaths?.includes(path))
				)
					finalObj[path] = store.$state[path]
				return finalObj
			}, {} as Partial<PiniaPluginContext['store']['$state']>)
		} else {
			if (hasExcludedPaths) {
				Object.keys(store.$state).reduce((finalObj, path) => {
					if (!storageItem.excludePaths?.includes(path))
						finalObj[path] = store.$state[path]
					return finalObj
				}, {} as Partial<PiniaPluginContext['store']['$state']>)
			}
		}

		storage.setItem(key, serialize(state))
	}

	return (context: PiniaPluginContext) => {
		const defaultStorages: PluginStorageItem[] | StorageItem[] = pluginOptions
			?.storageItemsDefault?.length
			? pluginOptions?.storageItemsDefault
			: [
					{
						storage: localStorage,
					},
			  ]
		let persist = false
		if (
			context.options.persistence &&
			typeof context.options.persistence.enabled != 'undefined'
		) {
			if (context.options.persistence.enabled) {
				persist = true
			}
		} else {
			if (pluginOptions) {
				persist = pluginOptions.persistenceDefault || true
			} else persist = true
		}

		if (persist) {
			const storageItems = context.options?.persistence?.storageItems?.length
				? context.options?.persistence?.storageItems
				: defaultStorages
			storageItems.forEach((storageItem) => {
				const storage = storageItem.storage || localStorage
				const deserialize = storageItem.deserialize || JSON.parse
				const storeKey = getStoreKey(storageItem, context.store.$id)
				const storageResult = storage.getItem(storeKey)

				if (storageResult) {
					context.store.$patch(deserialize(storageResult))
					updateStorage(storageItem, context.store, storeKey)
				}
			})

			context.store.$subscribe(() => {
				storageItems.forEach((storageItem) => {
					updateStorage(
						storageItem,
						context.store,
						getStoreKey(storageItem, context.store.$id)
					)
				})
			})
		}
	}
}
