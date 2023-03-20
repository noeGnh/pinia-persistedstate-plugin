import { defineStore } from 'pinia'

const state = () => ({
	message: 'Hello world',
	count: 0,
})

const getters = {}

const actions = {}

export const useExampleStore = defineStore('example', {
	state,
	getters,
	actions,
})
