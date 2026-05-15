import { SudokuGenerator } from '../engine/SudokuGenerator'
import type { PuzzleResult } from '../types/sudoku'

const generator = new SudokuGenerator()

self.onmessage = () => {
  const deadline = Date.now() + 2000
  let result: PuzzleResult | null = null

  try {
    result = generator.generateWithSolution('medium')
  } catch {
    // generation failed
  }

  if (!result || Date.now() > deadline) {
    self.postMessage({ type: 'timeout' })
  } else {
    self.postMessage({ type: 'result', payload: result })
  }
}
