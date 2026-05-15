<script setup lang="ts">
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, loading, error } = storeToRefs(store)

function boxBorderRight(col: number)  { return col === 2 || col === 5 }
function boxBorderBottom(row: number) { return row === 2 || row === 5 }
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-6 select-none">

    <!-- Error state -->
    <p v-if="error" class="screen-only text-red-600 text-sm text-center max-w-xs font-medium">
      {{ error }}
    </p>

    <!-- Loading: CSS skeleton table — hidden entirely in print -->
    <table v-else-if="loading" class="sudoku-table screen-only" aria-label="Loading puzzle">
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

    <!--
      Using <table> over CSS Grid:
      - Semantic row/column structure aids screen readers and print stylesheets
      - Print media queries target <tr>/<td> natively without extra overrides
      - Consistent cell sizing without explicit grid-template-columns
      - border-collapse on <table> guarantees shared borders render as single lines in print
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

  </div>
</template>

<style scoped>
/* ── Screen utility classes ─────────────────────────────────────────── */
.screen-only { }
.print-only  { display: none; }

/* ── Table base ─────────────────────────────────────────────────────── */
.sudoku-table {
  border-collapse: collapse;
  border: 3px solid #333;
}

/* ── Cell base ──────────────────────────────────────────────────────── */
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
  font-size: 1.125rem;
  background: #fff;
  padding: 0;
}

/* ── Box borders (border-only — no background used for structure) ───── */
.box-border-right  { border-right:  3px solid #333; }
.box-border-bottom { border-bottom: 3px solid #333; }

/* ── Clue cells ─────────────────────────────────────────────────────── */
.cell-clue {
  font-weight: 700;
  color: #1a1a1a;
  background: #f3f4f6; /* subtle on-screen distinction; stripped in print by default */
}

/* ── Empty cells ────────────────────────────────────────────────────── */
.cell-empty {
  font-weight: 400;
  background: #fff;
}

/* ── Skeleton ───────────────────────────────────────────────────────── */
.skeleton-cell {
  background: #e5e7eb;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { background: #e5e7eb; }
  50%       { background: #d1d5db; }
}

/* ── Print styles ───────────────────────────────────────────────────── */
@media print {
  /* Hide all screen-only UI */
  .screen-only { display: none !important; }

  /* Show print-only elements */
  .print-only  { display: block; }

  .print-title {
    font-size: 18pt;
    font-weight: 700;
    text-align: center;
    margin-bottom: 12pt;
    color: #000;
    font-family: serif;
  }

  /* Size grid to ~180mm — fits within A4 (210mm) and Letter (216mm) margins */
  .sudoku-table {
    width: 180mm;
    height: 180mm;
    border: 3px solid #000;
    page-break-inside: avoid;
  }

  .sudoku-cell {
    /* Let the table distribute 180mm across 9 columns evenly */
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    border: 1px solid #555;
    font-size: 14pt;
    /* Background suppressed by browser default — intentional per spec */
    background: transparent;
    color: #000;
  }

  /* Clue distinction in print: bold weight only — no background dependency */
  .cell-clue  { font-weight: 700; }
  .cell-empty { font-weight: 400; }

  .box-border-right  { border-right:  3px solid #000; }
  .box-border-bottom { border-bottom: 3px solid #000; }
}
</style>
