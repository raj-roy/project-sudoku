import { writeFileSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TARGET_PER_DIFFICULTY = 50

const DIFFICULTIES = [
  { value: 'baby',     clueCount: 52, clueMin: 50, clueMax: 55 },
  { value: 'kid',      clueCount: 45, clueMin: 41, clueMax: 49 },
  { value: 'teen',     clueCount: 36, clueMin: 32, clueMax: 40 },
  { value: 'adult',    clueCount: 27, clueMin: 24, clueMax: 31 },
  { value: 'einstein', clueCount: 24, clueMin: 22, clueMax: 28 },
]

// ── inline engine ────────────────────────────────────────────────────────────

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

function generatePuzzle(clueCount) {
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0))
  if (!fillBoard(solution)) throw new Error('fillBoard failed')
  const puzzle = solution.map(r => [...r])
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]))
  let filled = 81
  for (const [r, c] of cells) {
    if (filled <= clueCount) break
    const backup = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(puzzle) !== 1) puzzle[r][c] = backup
    else filled--
  }
  return puzzle
}

function validate(puzzle, clueMin, clueMax) {
  const clues = puzzle.flat().filter(v => v !== 0).length
  if (clues < clueMin || clues > clueMax) return `clue count ${clues} outside [${clueMin}, ${clueMax}]`
  if (countSolutions(puzzle) !== 1) return 'does not have exactly one solution'
  return null
}

// ── generation loop ───────────────────────────────────────────────────────────

const bank = {}
let totalFailures = 0
const globalStart = Date.now()

for (const diff of DIFFICULTIES) {
  console.log(`\n[${diff.value}] Generating ${TARGET_PER_DIFFICULTY} puzzles (target clues: ${diff.clueCount})...`)
  const puzzles = []
  let failures = 0

  for (let i = 0; puzzles.length < TARGET_PER_DIFFICULTY; i++) {
    const t0 = Date.now()
    const puzzle = generatePuzzle(diff.clueCount)
    const err = validate(puzzle, diff.clueMin, diff.clueMax)
    const ms = Date.now() - t0
    if (err) {
      failures++
    } else {
      const clues = puzzle.flat().filter(v => v !== 0).length
      process.stdout.write(`  [${puzzles.length + 1}/${TARGET_PER_DIFFICULTY}] ✓  clues=${clues}  ${ms}ms\n`)
      puzzles.push(puzzle)
    }
  }

  console.log(`  → ${puzzles.length} valid, ${failures} failed`)
  totalFailures += failures
  bank[diff.value] = puzzles
}

const elapsed = ((Date.now() - globalStart) / 1000).toFixed(1)
console.log(`\nCompleted in ${elapsed}s — total failures: ${totalFailures}`)

if (totalFailures > 0) {
  console.error('Aborting: fix the generator before bundling.')
  process.exit(1)
}

const outPath = resolve(__dirname, '../src/data/seedBank.json')
writeFileSync(outPath, JSON.stringify(bank))
console.log(`\nWritten → ${outPath}`)
console.log(`File size: ${(statSync(outPath).size / 1024).toFixed(1)} KB`)
