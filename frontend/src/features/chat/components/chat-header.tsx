import { useState } from "react";
import { Tooltip, Card } from "@radix-ui/themes"
import { MoonIcon, SunIcon, ExitIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { handleLogout } from '@/components/utils/handle-logout.ts';


const ThemeToggleButton = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [animate, setAnimate] = useState(false);

    const handleClick = () => {
        setAnimate(true);
        if (theme === 'light') {
            setTheme('dark');
            localStorage.setItem('theme', 'dark');
            document.getElementById('body')!.classList.add('dark');
        } else {
            setTheme('light');
            localStorage.setItem('theme', '');
            document.getElementById('body')!.classList.remove('dark');
        }
        (theme === 'light' ? setTheme('dark') : setTheme('light'))
        setTimeout(() => {
            setAnimate(false);
        }, 500);
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleClick}>
            {theme === 'light' ? (
                <MoonIcon className={`size-4 ${animate ? 'animate-in spin-in-180' : ''}`} strokeWidth="1.5" />
            ) : (
                <SunIcon className={`size-4 ${animate ? 'animate-out spin-out-180' : ''}`} strokeWidth="1.5" />
            )}
        </Button>
    );
};


export function ChatHeader() {
    return (
        <nav className="fixed w-full z-10 p-2">
            <Card>
                <div className="container flex justify-end items-center">
                    <div className="mb-2">
                        <Tooltip content="Theme" side="right">
                            <ThemeToggleButton />
                        </Tooltip>
                    </div>
                    <div className="mb-2">
                        <Tooltip content="Logout" side="right">
                            <Button variant='ghost' size='icon' onClick={handleLogout}>
                                <ExitIcon />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </Card>
        </nav>
    )
}