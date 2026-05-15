<script setup lang="ts">
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, loading, error } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-6">
    <h1 class="text-2xl font-bold tracking-wide">Sudoku</h1>

    <!-- Error state -->
    <div v-if="error" class="text-red-400 text-sm text-center max-w-xs">
      {{ error }}
    </div>

    <!-- Skeleton / Puzzle grid -->
    <div
      class="grid grid-cols-9 border-2 border-gray-600"
      :class="{ 'opacity-60 pointer-events-none': loading }"
    >
      <template v-if="loading">
        <div
          v-for="i in 81"
          :key="i"
          class="w-10 h-10 bg-gray-700 animate-pulse"
          :class="{
            'border-r-2 border-r-gray-500': (i % 3 === 0) && (i % 9 !== 0),
            'border-b-2 border-b-gray-500': Math.floor((i - 1) / 9) % 3 === 2 && Math.floor((i - 1) / 9) !== 8,
            'border border-gray-600': true,
          }"
        />
      </template>

      <template v-else-if="puzzle">
        <div
          v-for="(val, idx) in puzzle.flat()"
          :key="idx"
          class="w-10 h-10 flex items-center justify-center text-sm font-medium select-none border border-gray-600"
          :class="{
            'border-r-2 border-r-gray-400': (idx % 9) % 3 === 2 && (idx % 9) !== 8,
            'border-b-2 border-b-gray-400': Math.floor(idx / 9) % 3 === 2 && Math.floor(idx / 9) !== 8,
            'text-white': val !== 0,
            'text-transparent': val === 0,
            'bg-gray-800': val !== 0,
            'bg-gray-900': val === 0,
          }"
        >
          {{ val !== 0 ? val : '' }}
        </div>
      </template>
    </div>

    <button
      :disabled="loading"
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
      @click="store.generatePuzzle()"
    >
      {{ loading ? 'Generating…' : 'New Puzzle' }}
    </button>
  </div>
</template>
