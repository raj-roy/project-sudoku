export type Board = number[][]

export type Difficulty = 'medium'

export interface IDifficultyStrategy {
  readonly clueCount: number
}

export interface IPuzzleGenerator {
  generate(difficulty: Difficulty): Board
}

export interface IPuzzleValidator {
  hasUniqueSolution(board: Board): boolean
}

export interface IBoardAnalyzer {
  isValidPlacement(board: Board, row: number, col: number, num: number): boolean
}

export interface PuzzleResult {
  puzzle: Board
  solution: Board
}
