<script setup lang="ts">
import { computed } from 'vue'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const { mistakes, mistakeLimit } = storeToRefs(useSudokuStore())

// Warning when one mistake away from game over
const isWarning = computed(() =>
  mistakeLimit.value !== null && mistakes.value === mistakeLimit.value - 1
)
</script>

<template>
  <div
    v-if="mistakeLimit !== null"
    class="screen-only text-sm font-semibold tabular-nums transition-colors"
    :class="isWarning ? 'text-red-600' : 'text-gray-600'"
    role="status"
    :aria-label="`Mistakes: ${mistakes} of ${mistakeLimit}`"
  >
    Mistakes: {{ mistakes }} / {{ mistakeLimit }}
  </div>
</template>
