import type { Board, IBoardAnalyzer } from '../types/sudoku'

export class BoardState implements IBoardAnalyzer {
  private grid: Board

  constructor(grid?: Board) {
    this.grid = grid
      ? grid.map(row => [...row])
      : Array.from({ length: 9 }, () => Array(9).fill(0))
  }

  get(): Board {
    return this.grid.map(row => [...row])
  }

  set(row: number, col: number, val: number): void {
    this.grid[row][col] = val
  }

  clone(): BoardState {
    return new BoardState(this.grid)
  }

  isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false
      if (board[i][col] === num) return false
    }
    const br = Math.floor(row / 3) * 3
    const bc = Math.floor(col / 3) * 3
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (board[r][c] === num) return false
    return true
  }
}
