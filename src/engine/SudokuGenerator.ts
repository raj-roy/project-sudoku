import type { Board, Difficulty, IPuzzleGenerator, IPuzzleValidator, PuzzleResult } from '../types/sudoku'
import { BoardState } from './BoardState'
import { SudokuSolver } from './SudokuSolver'
import { getDifficultyStrategy } from './difficulty'

export class SudokuGenerator implements IPuzzleGenerator {
  private readonly analyzer = new BoardState()
  private readonly validator: IPuzzleValidator

  // DIP: accept any IPuzzleValidator; default to SudokuSolver
  constructor(validator: IPuzzleValidator = new SudokuSolver()) {
    this.validator = validator
  }

  generate(difficulty: Difficulty): Board {
    return this.generateWithSolution(difficulty).puzzle
  }

  generateWithSolution(difficulty: Difficulty, deadlineMs = 1800): PuzzleResult {
    const deadline = Date.now() + deadlineMs
    const solution = this.seedFullBoard()
    const puzzle = this.removeCells(solution, difficulty, deadline)
    return { puzzle, solution }
  }

  private seedFullBoard(): Board {
    const grid: Board = Array.from({ length: 9 }, () => Array(9).fill(0))
    const filled = this.fillBoard(grid)
    if (!filled) throw new Error('Failed to seed a full board')
    return grid
  }

  private fillBoard(grid: Board): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue
        for (const n of this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
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

  private removeCells(solution: Board, difficulty: Difficulty, deadline: number): Board {
    const { clueCount } = getDifficultyStrategy(difficulty)
    const puzzle = solution.map(r => [...r])
    const cells = this.shuffle(
      Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
    )
    let filled = 81
    for (const [r, c] of cells) {
      if (filled <= clueCount) break
      if (Date.now() >= deadline) break   // performance ceiling — stop early, keep current state

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
