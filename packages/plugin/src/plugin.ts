import type { PiniaPluginContext, PiniaPlugin } from 'pinia'
import type {
	PluginOptions,
	PluginStorageItem,
	StorageItem,
	AsyncStorage,
} from './interface'
import { isStorageItem } from './interface'

export function persistedStatePlugin(
	pluginOptions?: PluginOptions
): PiniaPlugin {
	const getStoreKey = (
		storageItem: PluginStorageItem | StorageItem,
		defaultKey: string
	) => {
		return (
			(pluginOptions?.storeKeysPrefix
				? pluginOptions?.storeKeysPrefix + '_'
				: '') +
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
		const serialize = storageItem?.serializer?.serialize || JSON.stringify
		let state = store.$state

		state = Object.keys(store.$state).reduce((finalObj, path) => {
			const insideIncludePaths =
				!storageItem.includePaths ||
				!storageItem.includePaths.length ||
				storageItem.includePaths.includes(path)

			const outsideExcludePaths =
				!storageItem.excludePaths ||
				!storageItem.excludePaths.length ||
				!storageItem.excludePaths.includes(path)

			if (insideIncludePaths && outsideExcludePaths)
				finalObj[path] = store.$state[path]
			return finalObj
		}, {} as Partial<PiniaPluginContext['store']['$state']>)

		try {
			const result = storage.setItem(key, serialize(state))

			if (result instanceof Promise) {
				store.$persistence.pending = true
				result
					.catch(function () {
						/* empty */
					})
					.finally(function () {
						store.$persistence.pending = false
					})
			}
		} catch (error) {
			if (pluginOptions?.debug) console.error(error)
		}
	}

	const assertStorage =
		pluginOptions?.assertStorage ||
		((storage: Storage | AsyncStorage) => {
			const key = '@@'
			const result = storage.setItem(key, '1')
			const removeItem = function () {
				storage.removeItem(key)
			}
			if (result instanceof Promise) {
				result.then(removeItem)
			} else {
				removeItem()
			}
		})

	return (context: PiniaPluginContext) => {
		context.store.$persistence = {
			pending: false,
		}
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
				persist = pluginOptions.persistenceDefault ?? true
			} else persist = true
		}

		const hydrate = (storageItem: PluginStorageItem | StorageItem) => {
			const storage = storageItem.storage || localStorage
			const deserialize = storageItem?.serializer?.deserialize || JSON.parse
			const storeKey = getStoreKey(storageItem, context.store.$id)
			const storageResult = storage.getItem(storeKey)

			if (storageResult) {
				try {
					if (storageResult instanceof Promise) {
						storageResult.then((value) => {
							context.store.$patch(deserialize(value))
						})
					} else {
						context.store.$patch(deserialize(storageResult))
					}
				} catch (error) {
					if (pluginOptions?.debug) console.error(error)
				}

				updateStorage(storageItem, context.store, storeKey)
			}
		}

		if (persist) {
			const storageItems = context.options?.persistence?.storageItems?.length
				? context.options?.persistence?.storageItems
				: defaultStorages
			storageItems.forEach((storageItem, i) => {
				let assertStorageResult: any
				try {
					assertStorageResult = assertStorage(
						storageItem.storage || localStorage
					)
				} catch (error) {
					if (pluginOptions?.debug) console.warn(error)
				}

				if (i == 0) {
					;(
						context.options?.persistence?.beforeHydrate ||
						function () {
							/* empty */
						}
					)(context.store.$state)
				}
				if (assertStorageResult instanceof Promise) {
					assertStorageResult
						.then(() => hydrate(storageItem))
						.catch((error) => {
							if (pluginOptions?.debug) console.warn(error)
						})
				} else {
					hydrate(storageItem)
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
