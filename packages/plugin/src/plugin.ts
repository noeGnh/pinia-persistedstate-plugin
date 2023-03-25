import type { PiniaPluginContext, PiniaPlugin } from 'pinia'
import type {
	PluginOptions,
	PluginStorageItem,
	StorageItem,
	Storage,
	UpdateAsyncStorageTask,
} from './interface'
import { isStorageItem } from './interface'
import { genId } from './utils'

export function persistencePlugin(pluginOptions?: PluginOptions): PiniaPlugin {
	const asyncTasks: UpdateAsyncStorageTask[] = []
	let currentAsyncTaskId: string | null = null

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

	const getFromStorageItem = (storageItem: PluginStorageItem | StorageItem) => {
		return {
			storage: storageItem.storage || localStorage,
			serialize: storageItem?.serializer?.serialize || JSON.stringify,
			deserialize: storageItem?.serializer?.deserialize || JSON.parse,
		}
	}

	const launchAsyncTasksListener = (): any => {
		if (!currentAsyncTaskId && asyncTasks.length) {
			updateStorage(
				asyncTasks[0].storageItem,
				asyncTasks[0].store,
				getStoreKey(asyncTasks[0].storageItem, asyncTasks[0].store.$id),
				asyncTasks[0].id
			)
		}

		return setTimeout(launchAsyncTasksListener, 500)
	}

	const updateStorage = (
		storageItem: PluginStorageItem | StorageItem,
		store: PiniaPluginContext['store'],
		key: string,
		asyncTaskId?: string
	) => {
		const { storage, serialize, deserialize } = getFromStorageItem(storageItem)

		let state = deserialize(serialize(store.$state))
		if (asyncTaskId) currentAsyncTaskId = asyncTaskId

		state = Object.keys(state).reduce((finalObj, path) => {
			const insideIncludePaths =
				!storageItem.includePaths ||
				!storageItem.includePaths.length ||
				storageItem.includePaths.includes(path)

			const outsideExcludePaths =
				!storageItem.excludePaths ||
				!storageItem.excludePaths.length ||
				!storageItem.excludePaths.includes(path)

			if (insideIncludePaths && outsideExcludePaths)
				finalObj[path] = state[path]
			return finalObj
		}, {} as Partial<PiniaPluginContext['store']['$state']>)

		try {
			const result = storage.setItem(key, serialize(state))

			if (result instanceof Promise) {
				store.$persistence.pending = true
				result
					.then(function () {
						if (asyncTaskId) {
							asyncTasks.splice(
								asyncTasks.findIndex((task) => asyncTaskId == task.id),
								1
							)
						}
					})
					.catch(function () {
						/* empty */
					})
					.finally(function () {
						if (asyncTaskId) currentAsyncTaskId = null
						store.$persistence.pending = false
					})
			}
		} catch (error) {
			if (pluginOptions?.debug) console.error(error)
		}
	}

	const assertStorage =
		pluginOptions?.assertStorage ||
		((storage: Storage) => {
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
		const ensureAsyncStorageUpdateOrder =
			pluginOptions?.ensureAsyncStorageUpdateOrder ?? true

		const hydrate = (storageItem: PluginStorageItem | StorageItem) => {
			const { storage, deserialize } = getFromStorageItem(storageItem)

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
					if (
						ensureAsyncStorageUpdateOrder &&
						(storageItem.storage?.getItem.constructor.name ===
							'AsyncFunction' ||
							storageItem.storage?.setItem.constructor.name ===
								'AsyncFunction' ||
							storageItem.storage?.removeItem.constructor.name ===
								'AsyncFunction')
					) {
						asyncTasks.push({
							id: genId(),
							storageItem: storageItem,
							store: context.store,
						})
					} else {
						updateStorage(
							storageItem,
							context.store,
							getStoreKey(storageItem, context.store.$id)
						)
					}
				})
			})

			if (ensureAsyncStorageUpdateOrder) launchAsyncTasksListener()
		}
	}
}
