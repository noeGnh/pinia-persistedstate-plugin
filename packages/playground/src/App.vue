<script setup lang="ts">
	import { useExampleStore } from './stores/example'

	const exampleStore = useExampleStore()
</script>

<template>
	{{ exampleStore.message }}
</template>

<style scoped></style>
