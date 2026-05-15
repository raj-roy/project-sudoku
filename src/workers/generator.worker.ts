import { SudokuGenerator } from '../engine/SudokuGenerator'
import type { PuzzleResult } from '../types/sudoku'

const generator = new SudokuGenerator()

self.onmessage = () => {
  const DEADLINE_MS = 1800  // 200ms headroom before the store's 2s hard kill
  let result: PuzzleResult | null = null

  try {
    result = generator.generateWithSolution('medium', DEADLINE_MS)
  } catch {
    // seedFullBoard failed — store will fall back to seed bank
  }

  if (result) {
    self.postMessage({ type: 'result', payload: result })
  } else {
    self.postMessage({ type: 'timeout' })
  }
}
