"use client"

import { ref, computed } from "vue"

const currentTheme = ref(localStorage.getItem("theme") || "light")

export function useTheme() {
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light"
    localStorage.setItem("theme", currentTheme.value)
    document.documentElement.setAttribute("data-theme", currentTheme.value)
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
    localStorage.setItem("theme", theme)
    document.documentElement.setAttribute("data-theme", theme)
  }

  // Aplicar tema inicial
  document.documentElement.setAttribute("data-theme", currentTheme.value)

  return {
    currentTheme: computed(() => currentTheme.value),
    toggleTheme,
    setTheme,
  }
}
