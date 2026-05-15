import { writeFileSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TARGET = 50
const CLUE_TARGET = 37

// ── inline engine (no TS imports from src/) ──────────────────────────────────

function isValid(grid, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false
  }
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
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
      for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
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

/** Counts solutions, capped at 2 for performance. */
function countSolutions(grid) {
  let count = 0
  function bt(g) {
    if (count >= 2) return
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c] !== 0) continue
        for (let n = 1; n <= 9; n++) {
          if (!isValid(g, r, c, n)) continue
          g[r][c] = n
          bt(g)
          g[r][c] = 0
        }
        return
      }
    }
    count++
  }
  bt(grid.map(r => [...r]))
  return count
}

function generatePuzzle() {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0))
  if (!fillBoard(solution)) throw new Error('fillBoard failed')

  const puzzle = solution.map(r => [...r])
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]))
  let filled = 81

  for (const [r, c] of cells) {
    if (filled <= CLUE_TARGET) break
    const backup = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(puzzle) !== 1) puzzle[r][c] = backup
    else filled--
  }

  return puzzle   // solution omitted — saves ~50% bundle size; derivable at runtime if needed
}

/** Validate a generated puzzle has exactly one solution and correct clue count. */
function validate(puzzle) {
  const clues = puzzle.flat().filter(v => v !== 0).length
  if (clues < 35 || clues > 45) return `clue count out of range: ${clues}`
  if (countSolutions(puzzle) !== 1) return 'does not have exactly one solution'
  return null
}

// ── generation loop ───────────────────────────────────────────────────────────

console.log(`Generating ${TARGET} seed puzzles (difficulty: medium, target clues: ${CLUE_TARGET})...\n`)

const puzzles = []
let failures = 0
const start = Date.now()

for (let i = 0; i < TARGET; i++) {
  const t0 = Date.now()
  const puzzle = generatePuzzle()
  const err = validate(puzzle)
  const ms = Date.now() - t0

  if (err) {
    console.error(`  [${i + 1}] FAILED validation: ${err}`)
    failures++
  } else {
    const clues = puzzle.flat().filter(v => v !== 0).length
    process.stdout.write(`  [${i + 1}/${TARGET}] ✓  clues=${clues}  ${ms}ms\n`)
    puzzles.push(puzzle)
  }
}

const elapsed = ((Date.now() - start) / 1000).toFixed(1)
console.log(`\nCompleted in ${elapsed}s — ${puzzles.length} valid, ${failures} failed.`)

if (failures > 0) {
  console.error(`\nAborting: ${failures} puzzle(s) failed validation. Fix the generator before bundling.`)
  process.exit(1)
}

if (puzzles.length < TARGET) {
  console.error(`\nAborting: only ${puzzles.length}/${TARGET} puzzles generated.`)
  process.exit(1)
}

const outPath = resolve(__dirname, '../src/data/seedBank.json')
writeFileSync(outPath, JSON.stringify(puzzles))
console.log(`\nWritten ${puzzles.length} puzzles → ${outPath}`)
console.log(`File size: ${(statSync(outPath).size / 1024).toFixed(1)} KB`)
