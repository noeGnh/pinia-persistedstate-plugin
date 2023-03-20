import type { PiniaPluginContext, PiniaPlugin } from 'pinia'
import type { PluginOptions, PluginStorageItem, StorageItem } from './interface'
import { isStorageItem } from './interface'

export const updateStorage = (
	storageItem: PluginStorageItem | StorageItem,
	store: PiniaPluginContext['store']
) => {
	const storage = storageItem.storage || localStorage
	const storeKey =
		(isStorageItem(storageItem) ? storageItem?.key : store.$id) || store.$id

	if (storageItem.paths && storageItem.paths.length) {
		const partialState = storageItem.paths.reduce((finalObj, key) => {
			finalObj[key] = store.$state[key]
			return finalObj
		}, {} as Partial<PiniaPluginContext['store']['$state']>)

		storage.setItem(storeKey, JSON.stringify(partialState))
	} else {
		storage.setItem(storeKey, JSON.stringify(store.$state))
	}
}

export function persistedStatePlugin(
	pluginOptions?: PluginOptions
): PiniaPlugin {
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
				const storeKey =
					(isStorageItem(storageItem) ? storageItem?.key : context.store.$id) ||
					context.store.$id
				const storageResult = storage.getItem(storeKey)

				if (storageResult) {
					context.store.$patch(JSON.parse(storageResult))
					updateStorage(storageItem, context.store)
				}
			})

			context.store.$subscribe(() => {
				storageItems.forEach((storageItem) => {
					updateStorage(storageItem, context.store)
				})
			})
		}
	}
}
