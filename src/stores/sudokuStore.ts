import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Board, PuzzleResult } from '../types/sudoku'
import rawSeedBank from '../data/seedBank.json'

const WORKER_TIMEOUT_MS = 2000

type WorkerMessage =
  | { type: 'result'; payload: PuzzleResult }
  | { type: 'timeout' }

function isValidSeedBank(data: unknown): data is Board[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray((data as Board[][])[0]) &&
    (data as Board[][])[0].length === 9
  )
}

function randomSeed(): Board {
  if (!isValidSeedBank(rawSeedBank)) {
    throw new Error('Seed bank is malformed or empty')
  }
  return rawSeedBank[Math.floor(Math.random() * rawSeedBank.length)] as Board
}

export const useSudokuStore = defineStore('sudoku', () => {
  const puzzle = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function generatePuzzle(): Promise<void> {
    loading.value = true
    error.value = null
    puzzle.value = null

    try {
      const result = await runWorker()
      puzzle.value = result.puzzle
    } catch {
      // Live generation timed out or failed — fall back to seed bank
      try {
        puzzle.value = randomSeed()
      } catch {
        error.value = "We couldn't load your puzzle. Please refresh the page."
      }
    } finally {
      loading.value = false
    }
  }

  function runWorker(): Promise<PuzzleResult> {
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

      worker.postMessage(null)
    })
  }

  return { puzzle, loading, error, generatePuzzle }
})
