import { Card, Text } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface WelcomeCardProps {
    title: string;
    content: string;
    handleMessageSend: (message: string) => void;
}

export function WelcomeCard({ title, content, handleMessageSend }: WelcomeCardProps) {

    function handleSuggestionClick() {
        handleMessageSend(content);
    }

    return (
        <div className="p-1 w-full h-32 overflow-y-scroll no-scrollbar">
            <Card className="h-full">
                <div className="flex flex-col h-full justify-between items-start">
                    <Text weight='bold' size='4'>
                        {title}
                    </Text>
                    <Text weight='light' size='1'>
                        {content}
                    </Text>
                    <div className="w-full flex justify-end">
                        <Button variant='ghost-no-hover' className="p-0 m-0" onClick={handleSuggestionClick}>
                            <Text weight='light' size='1'>
                                Prompt
                            </Text>
                            <ArrowRightIcon />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}