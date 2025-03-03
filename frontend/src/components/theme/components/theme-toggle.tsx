import { Moon, Sun, Laptop, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme, Theme, ColorTheme } from "@/components/theme/theme-provider";

interface ThemeToggleProps {
  variant?: "dropdown" | "buttons";
  onThemeSelect?: () => void;
}

interface ColorOption {
  key: ColorTheme;
  className: string;
  name: string;
}

export function ThemeToggle({
  variant = "dropdown",
  onThemeSelect,
}: ThemeToggleProps) {
  const {
    setTheme,
    theme,
    setColorTheme,
    colorTheme,
    avatarOverlay,
    setAvatarOverlay,
  } = useTheme();

  const handleThemeSelect = (newTheme: Theme, event: React.MouseEvent) => {
    event?.stopPropagation();
    setTheme(newTheme);
    if (onThemeSelect) setTimeout(onThemeSelect, 0);
  };

  const handleColorThemeSelect = (newColorTheme: ColorTheme) => {
    setColorTheme(newColorTheme);
    if (onThemeSelect) setTimeout(onThemeSelect, 0);
  };

  const colorOptions: ColorOption[] = [
    { key: "default", className: "bg-colorscheme-default", name: "Default" },
    { key: "red", className: "bg-colorscheme-red", name: "Red" },
    { key: "rose", className: "bg-colorscheme-rose", name: "Rose" },
    { key: "orange", className: "bg-colorscheme-orange", name: "Orange" },
    { key: "green", className: "bg-colorscheme-green", name: "Green" },
    { key: "blue", className: "bg-colorscheme-blue", name: "Blue" },
    { key: "yellow", className: "bg-colorscheme-yellow", name: "Yellow" },
    { key: "violet", className: "bg-colorscheme-violet", name: "Violet" },
  ];

  if (variant === "buttons") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(event) => {
          const nextTheme = {
            light: "dark",
            dark: "system",
            system: "light",
          }[theme] as Theme;
          handleThemeSelect(nextTheme, event);
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
        <Button
          variant="ghost"
          size="defaultNoPadding"
          className="flex justify-start w-full pr-4"
        >
          <Sun className={`mr-2 ${theme === "light" ? "" : "hidden"}`} />
          <Moon className={`mr-2 ${theme === "dark" ? "" : "hidden"}`} />
          <Laptop className={`mr-2 ${theme === "system" ? "" : "hidden"}`} />
          <span>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} -{" "}
            {colorOptions.find((co) => co.key === colorTheme)?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {[
          { mode: "light", Icon: Sun },
          { mode: "dark", Icon: Moon },
          { mode: "system", Icon: Laptop },
        ].map(({ mode, Icon }) => (
          <DropdownMenuItem
            key={`${mode}-theme-toggle--button`}
            onClick={(event) => handleThemeSelect(mode as Theme, event)}
          >
            <Icon className="mr-2" />
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <span className="text-xs font-medium pl-2">Primary Color</span>
        <div className="grid grid-cols-4 gap-1 p-2">
          {colorOptions.map(({ key, className, name }) => (
            <Button
              variant="ghost"
              size="sm"
              key={`cs-${key}`}
              className={`w-full h-4 p-0 hover:${className} hover:opacity-100 ${className} opacity-80 ${
                colorTheme === key ? "border-2 border-border opacity-100" : ""
              }`}
              onClick={() => handleColorThemeSelect(key as ColorTheme)}
              aria-label={`Select ${name} theme`}
            >
              <span className="sr-only">{name}</span>
            </Button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setAvatarOverlay(!avatarOverlay);
            if (onThemeSelect) setTimeout(onThemeSelect, 0);
          }}
        >
          <Image className="mr-2 h-4 w-4" />
          Avatar Color Overlay
          <div className="ml-auto">{avatarOverlay ? "On" : "Off"}</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
