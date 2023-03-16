import { defineStore } from 'pinia'

const state = () => ({
	message: 'Hello world',
})

const getters = {}

const actions = {}

export const useExampleStore = defineStore('example', {
	state,
	getters,
	actions,
})
