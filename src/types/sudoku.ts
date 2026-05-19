export type Board = number[][]
export type UserGrid = (number | null)[][]

export type CellStatus = 'empty' | 'pending' | 'correct' | 'incorrect' | 'revealed'

export interface CellEntry {
  value: number | null
  status: CellStatus
}

export type Difficulty = 'baby' | 'kid' | 'teen' | 'adult' | 'einstein'

export interface DifficultyMeta {
  value: Difficulty
  label: string
  sublabel: string
  clueMin: number
  clueMax: number
  mistakeLimit: number | null
}

export interface IDifficultyStrategy {
  readonly clueCount: number
  readonly mistakeLimit: number | null  // null = Baby (no limit shown)
}

export interface IPuzzleGenerator {
  generate(difficulty: Difficulty): Board
  generateWithSolution(difficulty: Difficulty): PuzzleResult
}

export const SolutionCount = {
  None: 0,
  One: 1,
  Multiple: 2,
} as const
export type SolutionCount = typeof SolutionCount[keyof typeof SolutionCount]

export interface IPuzzleValidator {
  countSolutions(board: Board): SolutionCount
  hasUniqueSolution(board: Board): boolean
}

export interface IBoardAnalyzer {
  isValidPlacement(board: Board, row: number, col: number, num: number): boolean
}

export interface PuzzleResult {
  puzzle: Board
  solution: Board
}
