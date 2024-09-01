import { Button } from "@radix-ui/themes";
import { HomeIcon, GearIcon, SunIcon } from "@radix-ui/react-icons";


export default function Navbar() {
    function onChangeMode() {
        if (localStorage.theme === 'dark') {
            document.getElementById('body')!.classList.remove('dark')
            localStorage.setItem('theme', '')
        } else {
            document.getElementById('body')!.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    return (
        <aside className='border-r border-white'>
            <div className="flex flex-col my-4 mx-2">
                <div className="mb-2">
                    <Button variant='surface'>
                        <HomeIcon />
                    </Button>
                </div>
                <div className="mb-2">
                    <Button variant='surface'>
                        <GearIcon />
                    </Button>
                </div>
                <div className="mb-2">
                    <Button onClick={onChangeMode} variant='surface'>
                        <SunIcon />
                    </Button>
                </div>
            </div>
        </aside>
    )
}