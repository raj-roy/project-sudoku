import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false
  }
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c] === num) return false
  return true
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function fillBoard(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue
      for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
        if (!isValid(grid, r, c, n)) continue
        grid[r][c] = n
        if (fillBoard(grid)) return true
        grid[r][c] = 0
      }
      return false
    }
  }
  return true
}

function countSolutions(grid) {
  let count = 0
  function solve(g) {
    if (count >= 2) return
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c] !== 0) continue
        for (let n = 1; n <= 9; n++) {
          if (!isValid(g, r, c, n)) continue
          g[r][c] = n
          solve(g)
          g[r][c] = 0
        }
        return
      }
    }
    count++
  }
  solve(grid.map(r => [...r]))
  return count
}

function generatePuzzle() {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0))
  fillBoard(solution)
  const puzzle = solution.map(r => [...r])
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]))
  let filled = 81
  for (const [r, c] of cells) {
    if (filled <= 37) break
    const backup = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(puzzle) !== 1) puzzle[r][c] = backup
    else filled--
  }
  return { puzzle, solution }
}

console.log('Generating 50 seed puzzles...')
const seeds = []
for (let i = 0; i < 50; i++) {
  process.stdout.write(`\r${i + 1}/50`)
  seeds.push(generatePuzzle())
}
console.log('\nDone.')
writeFileSync(resolve(__dirname, '../src/data/seedBank.json'), JSON.stringify(seeds))
console.log('Written to src/data/seedBank.json')
