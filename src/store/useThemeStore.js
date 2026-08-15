import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => {
        const newTheme = !state.isDarkMode;
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newTheme };
      }),
      initTheme: () => set((state) => {
        // Ejecutar al inicio para aplicar la clase si estaba guardado
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return state;
      })
    }),
    {
      name: 'theme-storage',
    }
  )
);
