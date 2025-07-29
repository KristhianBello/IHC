// src/composables/useTheme.js
import { ref, computed, onMounted } from 'vue'

const currentTheme = ref('light')

export function useTheme() {
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', currentTheme.value)
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    currentTheme.value = savedTheme
    document.documentElement.setAttribute('data-theme', savedTheme)
  })

  return {
    currentTheme: computed(() => currentTheme.value),
    toggleTheme,
    setTheme
  }
}
