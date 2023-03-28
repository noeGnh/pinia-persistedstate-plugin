<script setup lang="ts">
  import { useExampleStore } from './stores/example'

  const exampleStore = useExampleStore()
</script>

<template>
  <button @click="exampleStore.count += 1">
    {{ exampleStore.message }} - {{ exampleStore.count }}
  </button>
</template>

<style scoped></style>
