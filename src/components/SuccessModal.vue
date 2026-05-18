<script setup lang="ts">
import { useSudokuStore } from '../stores/sudokuStore'

const store = useSudokuStore()

function playAgain() {
  store.generatePuzzle()
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-title"
    aria-describedby="success-desc"
  >
    <!-- Modal panel -->
    <div class="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
      <p class="text-5xl" aria-hidden="true">🎉</p>

      <h2 id="success-title" class="text-2xl font-bold text-gray-900 text-center">
        Congratulations!
      </h2>

      <p id="success-desc" class="text-gray-600 text-center text-sm">
        Puzzle Solved! You completed the puzzle correctly.
      </p>

      <button
        class="mt-2 w-full px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        autofocus
        @click="playAgain"
      >
        Play Again
      </button>
    </div>
  </div>
</template>
