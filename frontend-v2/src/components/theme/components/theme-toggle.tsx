import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, Theme } from "@/components/theme/theme-provider";

interface ThemeToggleProps {
  variant?: "dropdown" | "buttons";
  onThemeSelect?: () => void;
}

export function ThemeToggle({
  variant = "dropdown",
  onThemeSelect,
}: ThemeToggleProps) {
  const { setTheme, theme } = useTheme();

  const handleThemeSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    if (onThemeSelect) {
      setTimeout(onThemeSelect, 0);
    }
  };

  if (variant === "buttons") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const nextTheme = {
            light: "dark",
            dark: "system",
            system: "light",
          }[theme] as Theme;
          handleThemeSelect(nextTheme);
        }}
        className="w-full justify-start"
      >
        <Sun
          className={`h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
          }`}
        />
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
        />
        <Laptop
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
            theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
        />
        <span className="ml-2">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="defaultNoPadding" className="flex justify-start gap-2 w-full px-1">
          <div className="relative">
            <Sun
              className={`h-[1.2rem] w-[1.2rem] transition-all ${
                theme === "light" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
              }`}
            />
            <Moon
              className={`absolute top-0 h-[1.2rem] w-[1.2rem] transition-all ${
                theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
              }`}
            />
            <Laptop
              className={`absolute top-0 h-[1.2rem] w-[1.2rem] transition-all ${
                theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
              }`}
            />
          </div>
          <span>
            {theme === "light" && "Light"}
            {theme === "dark" && "Dark"}
            {theme === "system" && "System"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeSelect("light")}>
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeSelect("dark")}>
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeSelect("system")}>
          <Laptop className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
