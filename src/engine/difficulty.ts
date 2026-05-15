import type { IDifficultyStrategy, Difficulty } from '../types/sudoku'

class MediumDifficulty implements IDifficultyStrategy {
  readonly clueCount = 37
}

const strategies: Record<Difficulty, IDifficultyStrategy> = {
  medium: new MediumDifficulty(),
}

export function getDifficultyStrategy(d: Difficulty): IDifficultyStrategy {
  return strategies[d]
}
