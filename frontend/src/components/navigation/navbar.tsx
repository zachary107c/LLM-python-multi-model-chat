import { useState } from "react";
import { Tooltip, Popover, Flex, Avatar, Box, TextArea, Text, Checkbox } from "@radix-ui/themes";
import { Button } from '@/components/ui/button';
import { GearIcon, PersonIcon, ChatBubbleIcon, DotsHorizontalIcon, MoonIcon, SunIcon, ExitIcon } from "@radix-ui/react-icons";
import { Link } from 'react-router-dom';
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

export default function Navbar() {
    const [index, setIndex] = useState(1);

    return (
        <aside className="border-r border-[#7d7d7db3] bg-[#22222211]">
            <div className="flex flex-col m-2 items-center">
                <div className="mb-2">
                    <Tooltip content="Profile" side="right">
                        <Link to="/profile">
                            <Button variant='ghost' size='icon' onClick={() => setIndex(0)} className={index === 0 ? 'bg-accent text-accent-foreground' : ''}>
                                <PersonIcon />
                            </Button>
                        </Link>
                    </Tooltip>
                </div>
                <div className="mb-2">
                    <Tooltip content="Home" side="right">
                        <Link to="/">
                            <Button variant='ghost' size='icon' onClick={() => setIndex(1)} className={index === 1 ? 'bg-accent text-accent-foreground' : ''}>
                                <ChatBubbleIcon />
                            </Button>
                        </Link>
                    </Tooltip>
                </div>
                <div className="mb-2">
                    <Tooltip content="Settings" side="right">
                        <Link to="/settings">
                            <Button variant='ghost' size='icon' onClick={() => setIndex(2)} className={index === 2 ? 'bg-accent text-accent-foreground' : ''}>
                                <GearIcon />
                            </Button>
                        </Link>
                    </Tooltip>
                </div>
                <div className="mb-2">
                    <Popover.Root>
                        <Popover.Trigger>
                            <Button variant="ghost" size='icon'>
                                <DotsHorizontalIcon />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content side="right" size='1'>
                            <div className="flex">
                                <div>
                                    <Tooltip content="Theme" side="right">
                                        <ThemeToggleButton />
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip content="Logout" side="right">
                                        <Button variant='ghost' size='icon' onClick={handleLogout}>
                                            <ExitIcon />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </Popover.Content>
                    </Popover.Root>
                </div>
            </div>
        </aside>
    )
}