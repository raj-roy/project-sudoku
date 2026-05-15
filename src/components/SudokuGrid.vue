<script setup lang="ts">
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, loading, error } = storeToRefs(store)

// 0-based row/col helpers
function boxBorderRight(col: number) { return col === 2 || col === 5 }
function boxBorderBottom(row: number) { return row === 2 || row === 5 }
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-6 select-none">
    <h1 class="text-2xl font-bold tracking-widest uppercase">Sudoku</h1>

    <!-- Error state — no grid rendered -->
    <p v-if="error" class="text-red-400 text-sm text-center max-w-xs">
      {{ error }}
    </p>

    <!-- Loading: CSS skeleton grid -->
    <div v-else-if="loading" class="border-2 border-gray-500 inline-grid grid-cols-9">
      <div
        v-for="i in 81"
        :key="i"
        class="w-10 h-10 bg-gray-700 animate-pulse border border-gray-600"
        :class="{
          'border-r-2 border-r-gray-400': boxBorderRight((i - 1) % 9),
          'border-b-2 border-b-gray-400': boxBorderBottom(Math.floor((i - 1) / 9)),
        }"
      />
    </div>

    <!-- Success: rendered puzzle grid -->
    <div v-else-if="puzzle" class="border-2 border-gray-400 inline-grid grid-cols-9">
      <div
        v-for="(val, idx) in puzzle.flat()"
        :key="idx"
        class="w-10 h-10 flex items-center justify-center text-sm font-semibold border border-gray-600"
        :class="{
          'border-r-2 border-r-gray-400': boxBorderRight(idx % 9),
          'border-b-2 border-b-gray-400': boxBorderBottom(Math.floor(idx / 9)),
          'text-gray-100 bg-gray-800': val !== 0,
          'bg-gray-900': val === 0,
        }"
      >
        {{ val !== 0 ? val : '' }}
      </div>
    </div>

    <!-- New Puzzle button — disabled while loading or in error state -->
    <button
      :disabled="loading || !!error"
      class="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      @click="store.generatePuzzle()"
    >
      {{ loading ? 'Generating…' : 'New Puzzle' }}
    </button>
  </div>
</template>
