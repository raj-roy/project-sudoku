<script setup lang="ts">
import { DIFFICULTIES } from '../engine/difficulty'
import { useSudokuStore } from '../stores/sudokuStore'
import { storeToRefs } from 'pinia'

const store = useSudokuStore()
const { difficulty, loading } = storeToRefs(store)
</script>

<template>
  <fieldset class="screen-only flex rounded-lg border border-gray-300 overflow-hidden" :disabled="loading">
    <legend class="sr-only">Difficulty</legend>
    <label
      v-for="d in DIFFICULTIES"
      :key="d.value"
      class="relative flex-1 cursor-pointer"
    >
      <input
        type="radio"
        name="difficulty"
        :value="d.value"
        v-model="difficulty"
        class="sr-only"
      />
      <span
        class="flex flex-col items-center justify-center px-3 py-2 text-center text-sm transition-colors select-none"
        :class="difficulty === d.value
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'"
      >
        <span class="font-semibold leading-tight">{{ d.label }}</span>
        <span class="text-xs opacity-80 leading-tight">{{ d.sublabel }}</span>
      </span>
    </label>
  </fieldset>
</template>
