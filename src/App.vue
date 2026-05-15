<script setup lang="ts">
import { onMounted } from 'vue'
import SudokuGrid from './components/SudokuGrid.vue'
import { useSudokuStore } from './stores/sudokuStore'

const store = useSudokuStore()
onMounted(() => store.generatePuzzle())
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-100">
    <SudokuGrid />
  </main>
</template>
