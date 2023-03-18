import type { PiniaPluginContext, PiniaPlugin } from 'pinia'
import type { Options } from './interface'

export function persistedStatePlugin(options?: Options): PiniaPlugin {
	return (context: PiniaPluginContext) => {
		if (options && options.persistByDefault) {
			context.store.$subscribe(() => {
				// react to store changes
			})
		}
	}
}
