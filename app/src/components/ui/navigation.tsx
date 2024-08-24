import { useEffect, useState } from "react";
import { Button, Box, Card, Heading } from "@radix-ui/themes";
import { ArrowRightIcon, ArrowLeftIcon, GearIcon, SunIcon } from "@radix-ui/react-icons";


export default function Navigation() {
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
        <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r w-15">
            <div className="mt-1 p-2">
                <Heading size='6'>bs.</Heading>
            </div>
            <div className="mt-1 p-2">
                <Button variant="surface" highContrast>
                    <GearIcon />
                </Button>
            </div>
            <div className="mt-1 p-2">
                <Button variant='surface' onClick={onChangeMode} highContrast>
                    <SunIcon />
                </Button>
            </div>
        </aside>
    )
}