import { describe, it, expect } from 'vitest'
import { SudokuGenerator } from '../engine/SudokuGenerator'
import { SudokuSolver } from '../engine/SudokuSolver'
import { SolutionCount } from '../types/sudoku'

const generator = new SudokuGenerator()
const solver = new SudokuSolver()

describe('SudokuGenerator + SudokuSolver integration', () => {
  it('generates a puzzle with exactly one solution', () => {
    const { puzzle } = generator.generateWithSolution('teen')
    expect(solver.countSolutions(puzzle)).toBe(SolutionCount.One)
  })

  it('generated puzzle (teen) has the correct number of clues (32–40)', () => {
    const { puzzle } = generator.generateWithSolution('teen')
    const clues = puzzle.flat().filter(v => v !== 0).length
    expect(clues).toBeGreaterThanOrEqual(32)
    expect(clues).toBeLessThanOrEqual(40)
  })

  it('solution satisfies all Sudoku constraints', () => {
    const { solution } = generator.generateWithSolution('teen')
    const isUnique = (arr: number[]) => new Set(arr).size === 9

    for (let i = 0; i < 9; i++) {
      expect(isUnique(solution[i])).toBe(true)
      expect(isUnique(solution.map(r => r[i]))).toBe(true)
    }
    for (let br = 0; br < 9; br += 3) {
      for (let bc = 0; bc < 9; bc += 3) {
        const box: number[] = []
        for (let r = br; r < br + 3; r++)
          for (let c = bc; c < bc + 3; c++)
            box.push(solution[r][c])
        expect(isUnique(box)).toBe(true)
      }
    }
  })

  it('generates two different puzzles across runs', () => {
    const a = generator.generateWithSolution('teen').puzzle.flat().join()
    const b = generator.generateWithSolution('teen').puzzle.flat().join()
    expect(a).not.toBe(b)
  })
})
