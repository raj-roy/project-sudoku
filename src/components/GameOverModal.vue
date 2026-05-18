<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'
import { DIFFICULTIES } from '../engine/difficulty'

const store = useSudokuStore()
const { difficulty, mistakes, mistakeLimit } = storeToRefs(store)

const collapsed = ref(false)

const diffLabel = computed(() =>
  DIFFICULTIES.find(d => d.value === difficulty.value)?.label ?? difficulty.value
)

const summaryLine = computed(() =>
  mistakeLimit.value === 0
    ? `Einstein mode allows zero mistakes.`
    : `You used all ${mistakeLimit.value} mistake${mistakeLimit.value === 1 ? '' : 's'} in ${diffLabel.value} mode.`
)

function tryAgain() {
  collapsed.value = false
  store.generatePuzzle()
}

function changeDifficulty() {
  collapsed.value = false
  store.clearPuzzle()
}

function studyBoard() {
  collapsed.value = true
}
</script>

<template>
  <!-- ── Collapsed banner ─────────────────────────────────────────── -->
  <div
    v-if="collapsed"
    class="fixed top-0 inset-x-0 z-50 h-12 flex items-center justify-between px-4 bg-gray-900 text-white shadow-lg"
    role="banner"
    aria-label="Game Over — studying board"
  >
    <span class="text-sm font-semibold">Game Over — studying board</span>
    <div class="flex gap-2">
      <button
        class="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        @click="tryAgain"
      >
        Try Again
      </button>
      <button
        class="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        @click="changeDifficulty"
      >
        Change Difficulty
      </button>
    </div>
  </div>

  <!-- ── Full modal ────────────────────────────────────────────────── -->
  <div
    v-else
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: rgba(0,0,0,0.65)"
    role="dialog"
    aria-modal="true"
    aria-labelledby="gameover-title"
    aria-describedby="gameover-desc"
  >
    <div class="bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center gap-4 max-w-sm w-full mx-4">

      <!-- Close / minimise -->
      <div class="w-full flex justify-end">
        <button
          class="text-gray-400 hover:text-gray-600 text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 rounded"
          aria-label="Study board — dismiss modal"
          @click="studyBoard"
        >
          ×
        </button>
      </div>

      <p class="text-5xl -mt-2" aria-hidden="true">💀</p>

      <h2 id="gameover-title" class="text-2xl font-bold text-gray-900 text-center">
        Game Over
      </h2>

      <p id="gameover-desc" class="text-gray-500 text-center text-sm">
        {{ summaryLine }}
      </p>

      <p class="text-gray-400 text-xs text-center">
        Mistakes: {{ mistakes }} / {{ mistakeLimit }}
      </p>

      <div class="w-full flex flex-col gap-2 mt-1">
        <button
          class="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          autofocus
          @click="tryAgain"
        >
          Try Again
        </button>

        <button
          class="w-full px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          @click="changeDifficulty"
        >
          Change Difficulty
        </button>

        <button
          class="w-full px-6 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 font-medium text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          @click="studyBoard"
        >
          Study Board
        </button>
      </div>

    </div>
  </div>
</template>
