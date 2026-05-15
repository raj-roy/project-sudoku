<script setup lang="ts">
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, loading, error } = storeToRefs(store)

function boxBorderRight(col: number) { return col === 2 || col === 5 }
function boxBorderBottom(row: number) { return row === 2 || row === 5 }
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-6 select-none">
    <h1 class="text-3xl font-bold tracking-widest uppercase text-gray-800">Sudoku</h1>

    <!-- Error state -->
    <p v-if="error" class="text-red-600 text-sm text-center max-w-xs font-medium">
      {{ error }}
    </p>

    <!-- Loading: CSS skeleton table -->
    <table v-else-if="loading" class="sudoku-table" aria-label="Loading puzzle">
      <tbody>
        <tr v-for="row in 9" :key="row">
          <td
            v-for="col in 9"
            :key="col"
            class="sudoku-cell skeleton-cell"
            :class="{
              'box-border-right':  boxBorderRight(col - 1),
              'box-border-bottom': boxBorderBottom(row - 1),
            }"
          />
        </tr>
      </tbody>
    </table>

    <!-- Success: rendered puzzle table -->
    <!--
      Using <table> over CSS Grid:
      - Semantic row/column structure aids screen readers and print stylesheets
      - Print media queries can target <thead>/<tbody>/<tr>/<td> natively
      - Consistent cell sizing without explicit grid-template-columns
    -->
    <table v-else-if="puzzle" class="sudoku-table" aria-label="Sudoku puzzle">
      <tbody>
        <tr v-for="(row, r) in puzzle" :key="r">
          <td
            v-for="(val, c) in row"
            :key="c"
            class="sudoku-cell"
            :class="{
              'box-border-right':  boxBorderRight(c),
              'box-border-bottom': boxBorderBottom(r),
              'cell-clue':  val !== 0,
              'cell-empty': val === 0,
            }"
          >
            {{ val !== 0 ? val : '' }}
          </td>
        </tr>
      </tbody>
    </table>

    <button
      :disabled="loading || !!error"
      class="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      @click="store.generatePuzzle()"
    >
      {{ loading ? 'Generating…' : 'New Puzzle' }}
    </button>
  </div>
</template>

<style scoped>
.sudoku-table {
  border-collapse: collapse;
  border: 3px solid #333;
}

.sudoku-cell {
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border: 1px solid #999;
  text-align: center;
  vertical-align: middle;
  cursor: default;
  pointer-events: none;
  font-size: 1.125rem; /* 18px */
  background: #fff;
}

.box-border-right  { border-right:  3px solid #333; }
.box-border-bottom { border-bottom: 3px solid #333; }

/* Clue cells: bold, dark number on white */
.cell-clue {
  font-weight: 700;
  color: #1a1a1a;
  background: #fff;
}

/* Empty cells: plain white, no content */
.cell-empty {
  background: #fff;
}

/* Skeleton pulse animation */
.skeleton-cell {
  background: #e5e7eb;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { background: #e5e7eb; }
  50%       { background: #d1d5db; }
}
</style>
