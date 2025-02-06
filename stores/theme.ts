import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light'
  }),
  
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      this.applyTheme(this.theme)
    },
    
    applyTheme(newTheme: string) {
      if (process.client) {
        // Save to localStorage
        localStorage.setItem('theme', newTheme)
        
        // Update data-theme attribute
        document.documentElement.setAttribute('data-theme', newTheme)
        
        // Update classes
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
          document.body.classList.add('darkbg')
        } else {
          document.documentElement.classList.remove('dark')
          document.body.classList.remove('darkbg')
        }
      }
    },

    initTheme() {
      if (process.client) {
        const savedTheme = localStorage.getItem('theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
        this.theme = initialTheme
        this.applyTheme(initialTheme)
      }
    }
  }
}) 