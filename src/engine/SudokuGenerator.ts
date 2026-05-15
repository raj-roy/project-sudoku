import type { Board, Difficulty, IPuzzleGenerator, PuzzleResult } from '../types/sudoku'
import { BoardState } from './BoardState'
import { SudokuSolver } from './SudokuSolver'
import { getDifficultyStrategy } from './difficulty'

export class SudokuGenerator implements IPuzzleGenerator {
  private analyzer = new BoardState()
  private validator = new SudokuSolver()

  generate(difficulty: Difficulty): Board {
    return this.generateWithSolution(difficulty).puzzle
  }

  generateWithSolution(difficulty: Difficulty): PuzzleResult {
    const solution = this.seedFullBoard()
    const puzzle = this.removeCells(solution, difficulty)
    return { puzzle, solution }
  }

  private seedFullBoard(): Board {
    const state = new BoardState()
    const grid = state.get()
    this.fillBoard(grid)
    return grid
  }

  private fillBoard(grid: Board): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue
        const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const n of nums) {
          if (!this.analyzer.isValidPlacement(grid, r, c, n)) continue
          grid[r][c] = n
          if (this.fillBoard(grid)) return true
          grid[r][c] = 0
        }
        return false
      }
    }
    return true
  }

  private removeCells(solution: Board, difficulty: Difficulty): Board {
    const { clueCount } = getDifficultyStrategy(difficulty)
    const puzzle = solution.map(r => [...r])
    const cells = this.shuffle(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
    )
    let filled = 81
    for (const [r, c] of cells) {
      if (filled <= clueCount) break
      const backup = puzzle[r][c]
      puzzle[r][c] = 0
      if (!this.validator.hasUniqueSolution(puzzle)) {
        puzzle[r][c] = backup
      } else {
        filled--
      }
    }
    return puzzle
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
}
