import { useState } from "react";
import { PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons"
import { Separator, Heading, Text, Card } from "@radix-ui/themes"
import { Button } from "@/components/ui/button";

export function ChatHistory() {

    const [selected, setSelected] = useState(0);
    const [messages, setMessages] = useState([
        'Hello World Python 🐍',
        'Is Klim F awesome? 🌈',
        'Did Bush do the 9/11 attack??!!',
        'What is the meaning of life? And the universe? And everything?? 🤔',
    ]);

    function handleSetSelected(index: number) {
        setSelected(index);
    }


    return (
        <div className="mx-4">
            <div className="flex flex-col justify-center align-top mt-2">
                <div className="flex flex-col w-full">
                    {messages.map((message, index) => (
                        <div className="w-full flex justify-start overflow-hidden">
                            {
                                index === selected ?
                                <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(index)}>
                                    {message}
                                </Button>
                                :
                                <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between " onClick={() => handleSetSelected(index)}>
                                    {message}
                                </Button>
                            }
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}