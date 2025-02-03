import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"
export type ColorTheme = "default" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet";

export const availableThemes: Theme[] = ["light", "dark", "system"];
export const availableColorThemes: ColorTheme[] = ["default", "red", "rose", "orange", "green", "blue", "yellow", "violet"];


type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme,
  storageKey?: string,
  colorStorageKey?: string,
}

type ThemeProviderState = {
  theme: Theme
  colorTheme: ColorTheme,
  setTheme: (theme: Theme) => void,
  setColorTheme: (colorTheme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  colorTheme: "default",
  setTheme: () => null,
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "default",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => 
    (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme
  );

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove(...availableThemes.map(t => t), ...availableColorThemes.map(ct => `theme-${ct}`));

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const appliedTheme = theme === "system" ? systemTheme : theme;

    root.classList.add(appliedTheme);
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [theme, colorTheme])

  const value = {
    theme,
    colorTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, colorTheme);
      setColorTheme(colorTheme);
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
