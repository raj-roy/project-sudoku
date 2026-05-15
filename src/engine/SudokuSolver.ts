import type { Board, IPuzzleValidator } from '../types/sudoku'
import { SolutionCount } from '../types/sudoku'
import { BoardState } from './BoardState'

export class SudokuSolver implements IPuzzleValidator {
  private readonly analyzer = new BoardState()

  /**
   * Counts solutions up to a cap of 2 — stops early once multiple are found.
   * This keeps the cost bounded during repeated cell-removal calls.
   */
  countSolutions(board: Board): SolutionCount {
    const grid = board.map(r => [...r])
    const found = this.backtrack(grid, 0)
    if (found === 0) return SolutionCount.None
    if (found === 1) return SolutionCount.One
    return SolutionCount.Multiple
  }

  hasUniqueSolution(board: Board): boolean {
    return this.countSolutions(board) === SolutionCount.One
  }

  /**
   * Finds the first empty cell, tries digits 1–9, recurses.
   * Returns as soon as `count` reaches 2 to avoid unnecessary work.
   */
  private backtrack(grid: Board, count: number): number {
    if (count >= 2) return count

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue

        for (let n = 1; n <= 9; n++) {
          if (!this.analyzer.isValidPlacement(grid, r, c, n)) continue
          grid[r][c] = n
          count = this.backtrack(grid, count)
          grid[r][c] = 0
          if (count >= 2) return count
        }

        // No valid digit for this cell — dead end
        return count
      }
    }

    // All cells filled — valid solution found
    return count + 1
  }
}
