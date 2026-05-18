<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, userGrid, selectedCell, loading, error } = storeToRefs(store)

// Template ref map: cellRefs[r][c] → <td> element
const cellRefs = ref<(HTMLTableCellElement | null)[][]>(
  Array.from({ length: 9 }, () => Array(9).fill(null))
)

function setCellRef(el: HTMLTableCellElement | null, r: number, c: number) {
  cellRefs.value[r][c] = el
}

function isClue(r: number, c: number): boolean {
  return (puzzle.value?.[r][c] ?? 0) !== 0
}

function displayValue(r: number, c: number): string {
  if (isClue(r, c)) return String(puzzle.value![r][c])
  const v = userGrid.value[r][c]
  return v !== null ? String(v) : ''
}

const selected = computed(() => selectedCell.value)

function isSelected(r: number, c: number): boolean {
  return selected.value?.[0] === r && selected.value?.[1] === c
}

// ── Interaction ──────────────────────────────────────────────────────────────

function onCellClick(r: number, c: number) {
  if (isClue(r, c)) return
  selectedCell.value = [r, c]
  nextTick(() => cellRefs.value[r][c]?.focus())
}

function onKeydown(e: KeyboardEvent, r: number, c: number) {
  if (isClue(r, c)) return

  if (e.key >= '1' && e.key <= '9') {
    e.preventDefault()
    store.setCell(r, c, Number(e.key))
    return
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault()
    store.setCell(r, c, null)
    return
  }

  // Arrow key navigation — stop at grid boundaries, no wrap
  const moves: Record<string, [number, number]> = {
    ArrowUp:    [-1,  0],
    ArrowDown:  [ 1,  0],
    ArrowLeft:  [ 0, -1],
    ArrowRight: [ 0,  1],
  }
  if (moves[e.key]) {
    e.preventDefault()
    const [dr, dc] = moves[e.key]
    const nr = Math.max(0, Math.min(8, r + dr))
    const nc = Math.max(0, Math.min(8, c + dc))
    moveFocus(nr, nc)
  }
}

// Tab/Shift+Tab: skip clue cells, exit grid naturally at boundaries
function onTab(e: KeyboardEvent, r: number, c: number) {
  const emptyCells = getEmptyCellsInOrder()
  const idx = emptyCells.findIndex(([er, ec]) => er === r && ec === c)

  if (!e.shiftKey) {
    if (idx === emptyCells.length - 1) return // let Tab exit the grid
    e.preventDefault()
    const [nr, nc] = emptyCells[idx + 1]
    moveFocus(nr, nc)
  } else {
    if (idx === 0) return // let Shift+Tab exit the grid
    e.preventDefault()
    const [nr, nc] = emptyCells[idx - 1]
    moveFocus(nr, nc)
  }
}

function getEmptyCellsInOrder(): [number, number][] {
  const cells: [number, number][] = []
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!isClue(r, c)) cells.push([r, c])
  return cells
}

function moveFocus(r: number, c: number) {
  selectedCell.value = [r, c]
  nextTick(() => cellRefs.value[r][c]?.focus())
}

function boxBorderRight(col: number)  { return col === 2 || col === 5 }
function boxBorderBottom(row: number) { return row === 2 || row === 5 }

function ariaLabel(r: number, c: number): string {
  if (isClue(r, c)) return `Row ${r + 1}, Column ${c + 1}, clue ${puzzle.value![r][c]}`
  const v = userGrid.value[r][c]
  return v !== null
    ? `Row ${r + 1}, Column ${c + 1}, ${v}`
    : `Row ${r + 1}, Column ${c + 1}, empty`
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 select-none">

    <!-- Error state -->
    <p v-if="error" class="screen-only text-red-600 text-sm text-center max-w-xs font-medium">
      {{ error }}
    </p>

    <!-- Loading skeleton -->
    <table v-else-if="loading" class="sudoku-table screen-only" aria-label="Loading puzzle" aria-busy="true">
      <tbody>
        <tr v-for="row in 9" :key="row" role="row">
          <td
            v-for="col in 9"
            :key="col"
            role="gridcell"
            class="sudoku-cell skeleton-cell"
            :class="{
              'box-border-right':  boxBorderRight(col - 1),
              'box-border-bottom': boxBorderBottom(row - 1),
            }"
          />
        </tr>
      </tbody>
    </table>

    <!-- Interactive puzzle grid -->
    <table
      v-else-if="puzzle"
      class="sudoku-table"
      role="grid"
      aria-label="Sudoku puzzle"
      aria-rowcount="9"
      aria-colcount="9"
    >
      <tbody>
        <tr v-for="(row, r) in puzzle" :key="r" role="row">
          <td
            v-for="(_, c) in row"
            :key="c"
            :ref="(el) => setCellRef(el as HTMLTableCellElement | null, r, c)"
            role="gridcell"
            :tabindex="isClue(r, c) ? -1 : 0"
            :aria-readonly="isClue(r, c) ? 'true' : undefined"
            :aria-label="ariaLabel(r, c)"
            :aria-selected="isSelected(r, c)"
            class="sudoku-cell"
            :class="{
              'box-border-right':  boxBorderRight(c),
              'box-border-bottom': boxBorderBottom(r),
              'cell-clue':         isClue(r, c),
              'cell-empty':        !isClue(r, c) && userGrid[r][c] === null,
              'cell-user':         !isClue(r, c) && userGrid[r][c] !== null,
              'cell-selected':     isSelected(r, c),
            }"
            :inputmode="isClue(r, c) ? undefined : 'numeric'"
            @click="onCellClick(r, c)"
            @keydown.tab.exact="onTab($event, r, c)"
            @keydown.shift.tab.exact="onTab($event, r, c)"
            @keydown="onKeydown($event, r, c)"
          >
            {{ displayValue(r, c) }}
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<style scoped>
/* ── Table ──────────────────────────────────────────────────────────── */
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
  padding: 0;
  border: 1px solid #999;
  text-align: center;
  vertical-align: middle;
  font-size: 1.125rem;
  background: #fff;
  cursor: default;
  /* Custom focus ring — never suppressed */
  outline: 3px solid transparent;
  outline-offset: -3px;
  transition: background 0.1s, outline-color 0.1s;
}

/* Keyboard / programmatic focus ring — WCAG AA 3:1 against white and light-blue */
.sudoku-cell:focus-visible {
  outline: 3px solid #0047AB;
  outline-offset: -3px;
  z-index: 1;
}

/* ── Box borders ────────────────────────────────────────────────────── */
.box-border-right  { border-right:  3px solid #333; }
.box-border-bottom { border-bottom: 3px solid #333; }

/* ── Clue cells: bold black, light grey bg, not interactive ─────────── */
.cell-clue {
  font-weight: 700;
  color: #1a1a1a;
  background: #f3f4f6;
  cursor: default;
}

/* ── Empty user cells ───────────────────────────────────────────────── */
.cell-empty {
  cursor: pointer;
  background: #fff;
}

/* ── User-entered value: blue, normal weight ────────────────────────── */
.cell-user {
  cursor: pointer;
  font-weight: 500;
  color: #2563EB;
  background: #fff;
}

/* ── Selected cell highlight (mouse click or programmatic) ──────────── */
.cell-selected {
  background: #DBEAFE !important; /* light blue — distinct from focus ring */
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

/* ── Print ──────────────────────────────────────────────────────────── */
@media print {
  .screen-only { display: none !important; }

  .sudoku-table {
    width: 180mm;
    height: 180mm;
    border: 3px solid #000;
    page-break-inside: avoid;
  }

  .sudoku-cell {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    border: 1px solid #555;
    font-size: 14pt;
    background: transparent;
    color: #000;
    outline: none; /* safe in print — no interactive focus needed */
  }

  .cell-clue        { font-weight: 700; }
  .cell-empty,
  .cell-user        { font-weight: 400; }
  .cell-user        { color: #000; } /* print in black regardless */
  .cell-selected    { background: transparent !important; }

  .box-border-right  { border-right:  3px solid #000; }
  .box-border-bottom { border-bottom: 3px solid #000; }
}
</style>
