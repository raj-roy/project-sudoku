import { describe, it, expect } from 'vitest'
import { SudokuSolver } from '../engine/SudokuSolver'
import { SolutionCount } from '../types/sudoku'
import type { Board } from '../types/sudoku'

const solver = new SudokuSolver()

// A known, fully solved board
const SOLVED: Board = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9],
]

// SOLVED with one cell cleared — still unique
const UNIQUE: Board = SOLVED.map(r => [...r])
UNIQUE[0][0] = 0

// Empty board — many solutions
const EMPTY: Board = Array.from({ length: 9 }, () => Array(9).fill(0))

// Unsolvable: two 5s in the same row, rest empty
const UNSOLVABLE: Board = Array.from({ length: 9 }, () => Array(9).fill(0))
UNSOLVABLE[0][0] = 5
UNSOLVABLE[0][1] = 5

describe('SudokuSolver', () => {
  describe('countSolutions', () => {
    it('returns One for a board with a unique solution', () => {
      expect(solver.countSolutions(UNIQUE)).toBe(SolutionCount.One)
    })

    it('returns Multiple for an empty board', () => {
      expect(solver.countSolutions(EMPTY)).toBe(SolutionCount.Multiple)
    })

    it('returns None for an unsolvable board', () => {
      expect(solver.countSolutions(UNSOLVABLE)).toBe(SolutionCount.None)
    })

    it('returns One for a fully solved board', () => {
      expect(solver.countSolutions(SOLVED)).toBe(SolutionCount.One)
    })
  })

  describe('hasUniqueSolution', () => {
    it('returns true when exactly one solution exists', () => {
      expect(solver.hasUniqueSolution(UNIQUE)).toBe(true)
    })

    it('returns false for an empty board', () => {
      expect(solver.hasUniqueSolution(EMPTY)).toBe(false)
    })

    it('returns false for an unsolvable board', () => {
      expect(solver.hasUniqueSolution(UNSOLVABLE)).toBe(false)
    })
  })

  describe('performance', () => {
    it('resolves a unique board within 500ms', () => {
      const start = Date.now()
      solver.hasUniqueSolution(UNIQUE)
      expect(Date.now() - start).toBeLessThan(500)
    })

    it('early-exits on a multi-solution board within 500ms', () => {
      const start = Date.now()
      solver.countSolutions(EMPTY)
      expect(Date.now() - start).toBeLessThan(500)
    })
  })
})
