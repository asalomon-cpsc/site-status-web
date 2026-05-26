<template>
  <button
    type="button"
    class="btn-icon theme-toggle"
    :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
    @click="toggleTheme"
  >
    <i class="bi" :class="theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'" aria-hidden="true"></i>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme.js'

const { theme, toggleTheme } = useTheme()
</script>
