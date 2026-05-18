import type { IDifficultyStrategy, Difficulty, DifficultyMeta } from '../types/sudoku'

class BabyDifficulty implements IDifficultyStrategy {
  readonly clueCount    = 52
  readonly mistakeLimit = null   // no counter shown
}
class KidDifficulty implements IDifficultyStrategy {
  readonly clueCount    = 45
  readonly mistakeLimit = 10
}
class TeenDifficulty implements IDifficultyStrategy {
  readonly clueCount    = 36
  readonly mistakeLimit = 5
}
class AdultDifficulty implements IDifficultyStrategy {
  readonly clueCount    = 27
  readonly mistakeLimit = 3
}
class EinsteinDifficulty implements IDifficultyStrategy {
  readonly clueCount    = 24
  readonly mistakeLimit = 0   // any wrong entry = immediate game over
}

const strategies: Record<Difficulty, IDifficultyStrategy> = {
  baby:     new BabyDifficulty(),
  kid:      new KidDifficulty(),
  teen:     new TeenDifficulty(),
  adult:    new AdultDifficulty(),
  einstein: new EinsteinDifficulty(),
}

export function getDifficultyStrategy(d: Difficulty): IDifficultyStrategy {
  return strategies[d]
}

export const DIFFICULTIES: DifficultyMeta[] = [
  { value: 'baby',     label: 'Baby',     sublabel: 'Very Easy', clueMin: 50, clueMax: 55, mistakeLimit: null },
  { value: 'kid',      label: 'Kid',      sublabel: 'Easy',      clueMin: 41, clueMax: 49, mistakeLimit: 10   },
  { value: 'teen',     label: 'Teen',     sublabel: 'Medium',    clueMin: 32, clueMax: 40, mistakeLimit: 5    },
  { value: 'adult',    label: 'Adult',    sublabel: 'Hard',      clueMin: 24, clueMax: 31, mistakeLimit: 3    },
  { value: 'einstein', label: 'Einstein', sublabel: 'Very Hard', clueMin: 22, clueMax: 28, mistakeLimit: 0    },
]
