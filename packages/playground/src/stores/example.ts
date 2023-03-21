import { defineStore } from 'pinia'

import Cookies from 'js-cookie'
import SecureLS from 'secure-ls'
import localforage from 'localforage'
import stringify from 'json-stringify-safe'

var ls = new SecureLS({
	encodingType: 'aes',
	isCompression: false,
	encryptionSecret: '810431dd-c332-49c2-ae80-da983a7629d2',
})

localforage.config({
	driver: [localforage.INDEXEDDB],
	name: 'Test IndexedDB',
	storeName: 'store',
})

const state = () => ({
	message: 'Hello world',
	count: 0,
})

const getters = {}

const actions = {}

const persistence = {
	enabled: true,
	storageItems: [
		{
			key: 'sample',
			storage: sessionStorage,
			includePaths: ['count'],
		},
		{
			key: 'encrypted_data',
			storage: {
				getItem: (key: string) => {
					try {
						return ls.get(key)
					} catch (error) {
						console.error(error)
					}
				},
				setItem: (key: string, value: any) => {
					try {
						ls.set(key, value)
					} catch (error) {
						console.error(error)
					}
				},
				removeItem: (key: string) => {
					try {
						ls.remove(key)
					} catch (error) {
						console.error(error)
					}
				},
			},
		},
		{
			storage: {
				getItem: async (key: string) => {
					return await localforage.getItem(key)
				},
				setItem: async (key: string, value: any) => {
					await localforage.setItem(key, value)
				},
				removeItem: async (key: string) => {
					await localforage.removeItem(key)
				},
			},
			serializer: {
				serialize: (value: any) => stringify(value),
			},
		},
		{
			storage: {
				getItem: (key: string) => {
					return Cookies.get(key)
				},
				setItem: (key: string, value: any) => {
					Cookies.set(key, value)
				},
				removeItem: (key: string) => {
					Cookies.remove(key)
				},
			},
			excludePaths: ['count'],
		},
	],
	beforeHydrate: (oldState: any) => {
		console.log(oldState)
	},
}

export const useExampleStore = defineStore('example', {
	state,
	getters,
	actions,
	persistence,
})
