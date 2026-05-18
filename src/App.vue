<script setup lang="ts">
import { onMounted } from 'vue'
import SudokuGrid from './components/SudokuGrid.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import SuccessModal from './components/SuccessModal.vue'
import MistakeCounter from './components/MistakeCounter.vue'
import GameOverModal from './components/GameOverModal.vue'
import { useSudokuStore } from './stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { loading, error, puzzle, isSolved, isGameOver, gameOverVisible } = storeToRefs(store)
const printPuzzle = () => window.print()
onMounted(() => store.generatePuzzle())
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-100">
    <SuccessModal v-if="isSolved" />
    <GameOverModal v-else-if="gameOverVisible" />
    <div class="flex flex-col items-center gap-6 p-6">

      <h1 class="screen-only text-3xl font-bold tracking-widest uppercase text-gray-800">
        Sudoku
      </h1>

      <DifficultySelector />

      <MistakeCounter />

      <SudokuGrid />

      <!-- Generate + Print buttons -->
      <div class="screen-only flex gap-3">
        <button
          :disabled="loading"
          class="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="store.generatePuzzle()"
        >
          {{ loading ? 'Generating…' : 'Generate Puzzle' }}
        </button>

        <button
          :disabled="loading || !puzzle || !!error"
          class="px-6 py-2 rounded border border-gray-400 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="printPuzzle()"
        >
          Print Puzzle
        </button>
      </div>

    </div>
  </main>
</template>

<style>
.screen-only { }
@media print {
  .screen-only { display: none !important; }
}
</style>
