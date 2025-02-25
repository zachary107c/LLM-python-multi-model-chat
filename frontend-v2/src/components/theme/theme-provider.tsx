import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";
export type ColorTheme =
  | "default"
  | "red"
  | "rose"
  | "orange"
  | "green"
  | "blue"
  | "yellow"
  | "violet";

export const availableThemes: Theme[] = ["light", "dark", "system"];
export const availableColorThemes: ColorTheme[] = [
  "default",
  "red",
  "rose",
  "orange",
  "green",
  "blue",
  "yellow",
  "violet",
];

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorTheme?: ColorTheme;
  storageKey?: string;
  colorStorageKey?: string;
  avatarOverlayStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  colorTheme: ColorTheme;
  avatarOverlay: boolean;
  systemOverride: Theme;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setAvatarOverlay: (overlay: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  colorTheme: "default",
  avatarOverlay: true,
  systemOverride: "light",
  setTheme: () => null,
  setColorTheme: () => null,
  setAvatarOverlay: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "default",
  storageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
  avatarOverlayStorageKey = "vite-ui-avatar-overlay",

  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme);
  const [avatarOverlay, setAvatarOverlay] = useState<boolean>(() => localStorage.getItem(avatarOverlayStorageKey) !== "false");
  const [systemOverride, setSystemOverride] = useState<Theme>("light");


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(
      ...availableThemes.map((t) => t),
      ...availableColorThemes.map((ct) => `theme-${ct}`)
    );

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    setSystemOverride(systemTheme);
    const appliedTheme = theme === "system" ? systemTheme : theme;

    root.classList.add(appliedTheme);
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }
  }, [theme, colorTheme]);

  const value = {
    theme,
    colorTheme,
    avatarOverlay,
    systemOverride,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, colorTheme);
      setColorTheme(colorTheme);
    },
    setAvatarOverlay: (overlay: boolean) => {
      localStorage.setItem("avatar-overlay", overlay.toString());
      setAvatarOverlay(overlay);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
