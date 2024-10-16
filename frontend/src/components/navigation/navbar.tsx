import { useState } from "react";
import { Tooltip, Popover } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { handleLogout } from "@/components/utils/handle-logout.ts";
import {
  Settings,
  MessageSquare,
  User,
  Ellipsis,
  Sun,
  MoonStar,
  LogOut,
  BrainCircuit,
} from "lucide-react";

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("theme", "dark");
      document.getElementById("body")!.classList.add("dark");
    } else {
      setTheme("light");
      localStorage.setItem("theme", "");
      document.getElementById("body")!.classList.remove("dark");
    }
    theme === "light" ? setTheme("dark") : setTheme("light");
    setTimeout(() => {
      setAnimate(false);
    }, 500);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      {theme === "light" ? (
        <MoonStar
          size={20}
          strokeWidth={1.5}
          className={`size-4 ${animate ? "animate-in spin-in-180" : ""}`}
        />
      ) : (
        <Sun
          size={20}
          strokeWidth={1.5}
          className={`size-4 ${animate ? "animate-out spin-out-180" : ""}`}
        />
      )}
    </Button>
  );
};

export default function Navbar() {
  const [index, setIndex] = useState(1);

  return (
    <aside className="border-r border-[#7d7d7db3] bg-[#22222211]">
      <div className="flex flex-col m-2 items-center">
        <div className="mb-2">
          <Tooltip content="Profile" side="right">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(0)}
                className={
                  index === 0 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <User size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Tooltip content="Home" side="right">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(1)}
                className={
                  index === 1 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <MessageSquare size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Tooltip content="Models" side="right">
            <Link to="/models">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(2)}
                className={
                  index === 2 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <BrainCircuit size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Tooltip content="Settings" side="right">
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(3)}
                className={
                  index === 3 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <Settings size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="ghost" size="icon">
                <Ellipsis size={20} strokeWidth={1.5} />
              </Button>
            </Popover.Trigger>
            <Popover.Content side="right" size="1">
              <div className="flex">
                <div>
                  <Tooltip content="Theme" side="right">
                    <ThemeToggleButton />
                  </Tooltip>
                </div>
                <div>
                  <Tooltip content="Logout" side="right">
                    <Button variant="ghost" size="icon" onClick={handleLogout}>
                      <LogOut size={17} strokeWidth={1.5} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    </aside>
  );
}
