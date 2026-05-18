import type { IDifficultyStrategy, Difficulty, DifficultyMeta } from '../types/sudoku'

class BabyDifficulty implements IDifficultyStrategy {
  readonly clueCount = 52   // midpoint of 50–55
}
class KidDifficulty implements IDifficultyStrategy {
  readonly clueCount = 45   // midpoint of 41–49
}
class TeenDifficulty implements IDifficultyStrategy {
  readonly clueCount = 36   // midpoint of 32–40
}
class AdultDifficulty implements IDifficultyStrategy {
  readonly clueCount = 27   // midpoint of 24–31
}
class EinsteinDifficulty implements IDifficultyStrategy {
  readonly clueCount = 24   // uniqueness enforcement floor; theoretical min is 17 but rare
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
  { value: 'baby',     label: 'Baby',     sublabel: 'Very Easy', clueMin: 50, clueMax: 55 },
  { value: 'kid',      label: 'Kid',      sublabel: 'Easy',      clueMin: 41, clueMax: 49 },
  { value: 'teen',     label: 'Teen',     sublabel: 'Medium',    clueMin: 32, clueMax: 40 },
  { value: 'adult',    label: 'Adult',    sublabel: 'Hard',      clueMin: 24, clueMax: 31 },
  { value: 'einstein', label: 'Einstein', sublabel: 'Very Hard', clueMin: 22, clueMax: 28 },
]
