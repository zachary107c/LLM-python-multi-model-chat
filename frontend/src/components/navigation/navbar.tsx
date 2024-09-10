import { useState } from 'react';
import { Button, Avatar, Text } from "@radix-ui/themes";
import { HomeIcon, GearIcon, SunIcon, MoonIcon, ExitIcon } from "@radix-ui/react-icons";
import { Link } from 'react-router-dom';
import { handleLogout } from '@/components/utils/handle-logout.ts';


export default function Navbar() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    function onChangeMode() {
        if (localStorage.theme === 'dark') {
            document.getElementById('body')!.classList.remove('dark')
            localStorage.setItem('theme', '')
            setTheme('light')
        } else {
            document.getElementById('body')!.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setTheme('dark')
        }
    }


    return (
        <aside className="border-r border-[#7d7d7db3] bg-[#2222222f]">
            <div className="flex flex-col my-2 mx-2 items-center">
                <div className="mb-2">
                    <Link to="/">
                        <Button variant='soft' size='1'>
                            <HomeIcon />
                        </Button>
                    </Link>
                </div>
                <div className="mb-2">
                    <Link to="/settings">
                        <Button variant='soft' size='1'>
                            <GearIcon />
                        </Button>
                    </Link>
                </div>
                <div className="mb-2">
                    <Button onClick={onChangeMode} variant='soft' size='1'>
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </Button>
                </div>
                <div className="mb-2">
                    <Button variant='soft' size='1' color='red' onClick={handleLogout}>
                        <ExitIcon />
                    </Button>
                </div>
            </div>
        </aside>
    )
}