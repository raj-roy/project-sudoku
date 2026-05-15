import type { Board, IPuzzleValidator } from '../types/sudoku'
import { BoardState } from './BoardState'

export class SudokuSolver implements IPuzzleValidator {
  private analyzer = new BoardState()

  hasUniqueSolution(board: Board): boolean {
    const grid = board.map(r => [...r])
    let count = 0
    this.solve(grid, () => { count++ })
    return count === 1
  }

  solve(grid: Board, onSolution?: () => void): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue
        for (let n = 1; n <= 9; n++) {
          if (!this.analyzer.isValidPlacement(grid, r, c, n)) continue
          grid[r][c] = n
          const done = this.solve(grid, onSolution)
          if (done && !onSolution) return true
          if (onSolution && done) {
            grid[r][c] = 0
            return false
          }
          grid[r][c] = 0
        }
        return false
      }
    }
    onSolution?.()
    return true
  }
}
