import { SudokuGenerator } from '../engine/SudokuGenerator'
import type { Difficulty, PuzzleResult } from '../types/sudoku'

const generator = new SudokuGenerator()

self.onmessage = (e: MessageEvent<{ difficulty: Difficulty }>) => {
  const DEADLINE_MS = 1800
  let result: PuzzleResult | null = null

  try {
    result = generator.generateWithSolution(e.data.difficulty, DEADLINE_MS)
  } catch {
    // seedFullBoard failed — store will fall back to seed bank
  }

  if (result) self.postMessage({ type: 'result', payload: result })
  else        self.postMessage({ type: 'timeout' })
}
