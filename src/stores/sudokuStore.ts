import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import type { Board, CellEntry, Difficulty, PuzzleResult } from '../types/sudoku'
import { SudokuSolver } from '../engine/SudokuSolver'
import rawSeedBank from '../data/seedBank.json'
import { getDifficultyStrategy } from '../engine/difficulty'

const WORKER_TIMEOUT_MS = 2000

type SeedBank = Record<string, Board[]>
type WorkerMessage =
  | { type: 'result'; payload: PuzzleResult }
  | { type: 'timeout' }

function randomSeed(difficulty: Difficulty): Board {
  const bank = rawSeedBank as SeedBank
  const pool = bank[difficulty]
  if (!Array.isArray(pool) || pool.length === 0)
    throw new Error(`Seed bank missing for difficulty: ${difficulty}`)
  return pool[Math.floor(Math.random() * pool.length)] as Board
}

function deriveSolution(puzzle: Board): Board {
  const solver = new SudokuSolver()
  const grid = puzzle.map(r => [...r])
  solver.solve(grid)
  return grid
}

function emptyCellGrid(): CellEntry[][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellEntry => ({ value: null, status: 'empty' }))
  )
}

export const useSudokuStore = defineStore('sudoku', () => {
  const puzzle       = ref<Board | null>(null)
  const solution     = ref<Board | null>(null)
  const cellGrid     = ref<CellEntry[][]>(emptyCellGrid())
  const selectedCell = ref<[number, number] | null>(null)
  const loading      = ref(false)
  const error        = ref<string | null>(null)
  const difficulty   = ref<Difficulty>('baby')
  const solved              = ref(false)
  const mistakes            = ref(0)
  const gameOverVisible     = ref(false)

  const mistakeLimit = computed(() => getDifficultyStrategy(difficulty.value).mistakeLimit)
  const isGameOver   = computed(() =>
    mistakeLimit.value !== null &&
    (mistakeLimit.value > 0 ? mistakes.value >= mistakeLimit.value : mistakes.value > 0)
  )

  function clearPuzzle() {
    puzzle.value = null
    solution.value = null
    cellGrid.value = emptyCellGrid()
    gameOverVisible.value = false
    mistakes.value = 0
    solved.value = false
  }

  watch(puzzle, () => {
    cellGrid.value           = emptyCellGrid()
    solved.value             = false
    mistakes.value           = 0
    gameOverVisible.value    = false
  })

  function isClue(row: number, col: number): boolean {
    return (puzzle.value?.[row][col] ?? 0) !== 0
  }

  /** Write a digit as pending — no validation yet. */
  function setPending(row: number, col: number, value: number | null): void {
    if (isClue(row, col) || isGameOver.value || solved.value) return
    cellGrid.value[row][col] = {
      value,
      status: value === null ? 'empty' : 'pending',
    }
  }

  /** Commit the current pending value — validate against solution. */
  function commitCell(row: number, col: number): void {
    if (isClue(row, col) || isGameOver.value || solved.value) return
    const entry = cellGrid.value[row][col]
    if (entry.status !== 'pending') return

    const expected = solution.value?.[row][col] ?? null
    const isCorrect = entry.value === expected
    cellGrid.value[row][col] = {
      value: entry.value,
      status: isCorrect ? 'correct' : 'incorrect',
    }
    if (!isCorrect) {
      mistakes.value++
      if (isGameOver.value) {
        revealSolution()
        setTimeout(() => { gameOverVisible.value = true }, 400)
      }
    }
    checkCompletion()
  }

  function revealSolution(): void {
    if (!solution.value) return
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        if (isClue(r, c)) continue
        const entry = cellGrid.value[r][c]
        if (entry.status === 'correct') continue   // keep user's correct entries
        cellGrid.value[r][c] = { value: solution.value[r][c], status: 'revealed' }
      }
  }

  function checkCompletion(): void {
    if (!puzzle.value || !solution.value || solved.value) return
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) {
        if (isClue(r, c)) continue
        if (cellGrid.value[r][c].status !== 'correct') return
      }
    solved.value = true
  }

  const isSolved = computed(() => solved.value)

  async function generatePuzzle(): Promise<void> {
    loading.value      = true
    error.value        = null
    puzzle.value       = null
    solution.value     = null
    selectedCell.value = null

    try {
      const result = await runWorker(difficulty.value)
      puzzle.value   = result.puzzle
      solution.value = result.solution
    } catch {
      try {
        const fallback = randomSeed(difficulty.value)
        puzzle.value   = fallback
        solution.value = deriveSolution(fallback)
      } catch {
        error.value = "We couldn't load your puzzle. Please refresh the page."
      }
    } finally {
      loading.value = false
    }
  }

  function runWorker(diff: Difficulty): Promise<PuzzleResult> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL('../workers/generator.worker.ts', import.meta.url),
        { type: 'module' }
      )
      const timer = setTimeout(() => {
        worker.terminate()
        reject(new Error('timeout'))
      }, WORKER_TIMEOUT_MS)

      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        clearTimeout(timer)
        worker.terminate()
        if (e.data.type === 'result') resolve(e.data.payload)
        else reject(new Error('timeout'))
      }
      worker.onerror = () => {
        clearTimeout(timer)
        worker.terminate()
        reject(new Error('worker error'))
      }
      worker.postMessage({ difficulty: diff })
    })
  }

  return {
    puzzle, solution, cellGrid, selectedCell,
    loading, error, difficulty, isSolved, mistakes, mistakeLimit, isGameOver,
    gameOverVisible, clearPuzzle,
    setPending, commitCell, generatePuzzle,
  }
})
