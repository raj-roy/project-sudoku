<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { puzzle, cellGrid, selectedCell, loading, error, isGameOver } = storeToRefs(store)

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
  const v = cellGrid.value[r][c].value
  return v !== null ? String(v) : ''
}

function isLocked(r: number, c: number): boolean {
  return isClue(r, c) || isGameOver.value
}

function isSelected(r: number, c: number): boolean {
  return selectedCell.value?.[0] === r && selectedCell.value?.[1] === c
}

// ── Interaction ──────────────────────────────────────────────────────────────

function onCellClick(r: number, c: number) {
  if (isLocked(r, c)) return
  selectedCell.value = [r, c]
  nextTick(() => cellRefs.value[r][c]?.focus())
}

function onKeydown(e: KeyboardEvent, r: number, c: number) {
  if (isLocked(r, c)) return

  if (e.key >= '1' && e.key <= '9') {
    e.preventDefault()
    store.setPending(r, c, Number(e.key))
    return
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault()
    store.setPending(r, c, null)
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    store.commitCell(r, c)
    return
  }

  const moves: Record<string, [number, number]> = {
    ArrowUp:    [-1,  0],
    ArrowDown:  [ 1,  0],
    ArrowLeft:  [ 0, -1],
    ArrowRight: [ 0,  1],
  }
  if (moves[e.key]) {
    e.preventDefault()
    store.commitCell(r, c)   // commit before moving
    const [dr, dc] = moves[e.key]
    moveFocus(Math.max(0, Math.min(8, r + dr)), Math.max(0, Math.min(8, c + dc)))
  }
}

function onTab(e: KeyboardEvent, r: number, c: number) {
  const emptyCells = getEmptyCellsInOrder()
  const idx = emptyCells.findIndex(([er, ec]) => er === r && ec === c)

  store.commitCell(r, c)   // commit before tabbing away

  if (!e.shiftKey) {
    if (idx === emptyCells.length - 1) return
    e.preventDefault()
    moveFocus(...emptyCells[idx + 1])
  } else {
    if (idx === 0) return
    e.preventDefault()
    moveFocus(...emptyCells[idx - 1])
  }
}

function onBlur(r: number, c: number) {
  store.commitCell(r, c)
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
  const { value, status } = cellGrid.value[r][c]
  if (value === null) return `Row ${r + 1}, Column ${c + 1}, empty`
  const statusLabel = status === 'incorrect' ? ', incorrect' : status === 'pending' ? ', pending' : ''
  return `Row ${r + 1}, Column ${c + 1}, ${value}${statusLabel}`
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 select-none">

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
            :tabindex="isLocked(r, c) ? -1 : 0"
            :aria-readonly="isLocked(r, c) ? 'true' : undefined"
            :aria-label="ariaLabel(r, c)"
            :aria-selected="isSelected(r, c)"
            :aria-invalid="cellGrid[r][c].status === 'incorrect' ? 'true' : undefined"
            class="sudoku-cell"
            :class="{
              'box-border-right':  boxBorderRight(c),
              'box-border-bottom': boxBorderBottom(r),
              'cell-clue':         isClue(r, c),
              'cell-empty':        !isClue(r, c) && cellGrid[r][c].status === 'empty',
              'cell-pending':      cellGrid[r][c].status === 'pending',
              'cell-correct':      cellGrid[r][c].status === 'correct',
              'cell-incorrect':    cellGrid[r][c].status === 'incorrect',
              'cell-revealed':     cellGrid[r][c].status === 'revealed',
              'cell-selected':     isSelected(r, c),
            }"
            :inputmode="isLocked(r, c) ? undefined : 'numeric'"
            @click="onCellClick(r, c)"
            @blur="onBlur(r, c)"
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
.sudoku-table {
  border-collapse: collapse;
  border: 3px solid #333;
}

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
  outline: 3px solid transparent;
  outline-offset: -3px;
  transition: background 0.1s, outline-color 0.1s;
}

.sudoku-cell:focus-visible {
  outline: 3px solid #0047AB;
  outline-offset: -3px;
  z-index: 1;
}

.box-border-right  { border-right:  3px solid #333; }
.box-border-bottom { border-bottom: 3px solid #333; }

/* Clue: bold black on light grey */
.cell-clue {
  font-weight: 700;
  color: #1a1a1a;
  background: #f3f4f6;
  cursor: default;
}

/* Empty: plain white, pointer cursor */
.cell-empty {
  cursor: pointer;
  background: #fff;
}

/* Pending: italic blue — visually neutral, signals "not yet confirmed" */
.cell-pending {
  cursor: pointer;
  font-style: italic;
  font-weight: 500;
  color: #2563EB;
  background: #fff;
}

/* Committed correct: solid blue, upright */
.cell-correct {
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  color: #2563EB;
  background: #fff;
}

/* Committed incorrect: red */
.cell-incorrect {
  cursor: pointer;
  font-style: normal;
  font-weight: 600;
  color: #DC2626;
  background: #fff;
}

/* Solution revealed on game over: italic grey */
.cell-revealed {
  cursor: default;
  font-style: italic;
  font-weight: 400;
  color: #9CA3AF;
  background: #fff;
}

/* Selected highlight — sits on top of all cell states */
.cell-selected {
  background: #DBEAFE !important;
}

/* Skeleton */
.skeleton-cell {
  background: #e5e7eb;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { background: #e5e7eb; }
  50%       { background: #d1d5db; }
}

/* Print */
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
    font-style: normal;
    outline: none;
  }

  .cell-clue     { font-weight: 700; }
  .cell-selected { background: transparent !important; }

  .box-border-right  { border-right:  3px solid #000; }
  .box-border-bottom { border-bottom: 3px solid #000; }
}
</style>
