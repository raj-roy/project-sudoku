import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Board, Difficulty, PuzzleResult } from '../types/sudoku'
import rawSeedBank from '../data/seedBank.json'

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

export const useSudokuStore = defineStore('sudoku', () => {
  const puzzle   = ref<Board | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)
  const difficulty = ref<Difficulty>('baby')

  async function generatePuzzle(): Promise<void> {
    loading.value = true
    error.value   = null
    puzzle.value  = null

    try {
      const result = await runWorker(difficulty.value)
      puzzle.value = result.puzzle
    } catch {
      try {
        puzzle.value = randomSeed(difficulty.value)
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

  return { puzzle, loading, error, difficulty, generatePuzzle }
})
