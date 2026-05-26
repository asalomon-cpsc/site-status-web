import { ref, watch } from 'vue'

const STORAGE_KEY = 'site-status-theme'
const theme = ref('dark')
let watchStarted = false

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(value) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', value)
}

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
  } else {
    theme.value = prefersDark() ? 'dark' : 'light'
  }
  applyTheme(theme.value)
}

function ensureThemeWatch() {
  if (watchStarted) return
  watchStarted = true
  watch(theme, (value) => {
    applyTheme(value)
    localStorage.setItem(STORAGE_KEY, value)
  })
}

export function useTheme() {
  ensureThemeWatch()

  function setTheme(value) {
    if (value === 'light' || value === 'dark') theme.value = value
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
