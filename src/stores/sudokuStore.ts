import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Board, PuzzleResult } from '../types/sudoku'
import seedBank from '../data/seedBank.json'

type WorkerMessage =
  | { type: 'result'; payload: PuzzleResult }
  | { type: 'timeout' }

function randomSeed(): PuzzleResult {
  const seeds = seedBank as PuzzleResult[]
  return seeds[Math.floor(Math.random() * seeds.length)]
}

export const useSudokuStore = defineStore('sudoku', () => {
  const puzzle = ref<Board | null>(null)
  const solution = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function generatePuzzle(): Promise<void> {
    loading.value = true
    error.value = null
    puzzle.value = null
    solution.value = null

    try {
      const result = await runWorker()
      puzzle.value = result.puzzle
      solution.value = result.solution
    } catch {
      try {
        const fallback = randomSeed()
        puzzle.value = fallback.puzzle
        solution.value = fallback.solution
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
      }, 2000)

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

  return { puzzle, solution, loading, error, generatePuzzle }
})
