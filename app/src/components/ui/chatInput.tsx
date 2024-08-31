import { TextArea } from "@radix-ui/themes";
import { Button } from "@radix-ui/themes";
import { useState } from 'react';

export default function ChatInput() {
    const [textAreaValue, setTextAreaValue] = useState('');
    return (
        <div className="flex justify-between">
            <div className="mr-2 w-full">
                <TextArea className="w-[100%]" variant="surface" radius="medium" size="1" value={textAreaValue} onChange={(event) => setTextAreaValue(event.target.value)}></TextArea>
            </div>
            <div>
                <Button onClick={() => console.log(textAreaValue)}>Send</Button>
            </div>
        </div>
    )
}