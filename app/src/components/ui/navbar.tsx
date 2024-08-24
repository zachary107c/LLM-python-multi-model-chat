import { Button, Heading, Separator } from "@radix-ui/themes";
import { GitHubLogoIcon, SunIcon } from "@radix-ui/react-icons";

export default function NavBar() {
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
        <nav className="border-b">
            <div className='h-14 flex justify-between items-center align-middle ml-15'>
            </div>
        </nav>
    )
}