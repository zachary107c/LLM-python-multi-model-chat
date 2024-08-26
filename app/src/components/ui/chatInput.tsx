import { TextArea } from "@radix-ui/themes";
import { Button } from "@radix-ui/themes";

export default function ChatInput() {
    return (
        <div className="flex justify between">
            <div className="mr-2">
                <TextArea variant="surface" radius="medium" size="1"></TextArea>
            </div>
            <div>
                <Button>Send</Button>
            </div>
        </div>
    )
}