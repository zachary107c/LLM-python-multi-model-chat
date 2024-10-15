import { Card, Text } from "@radix-ui/themes";
import { ArrowRightIcon, LightningBoltIcon } from "@radix-ui/react-icons";
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
            <div className="rainbow-border h-full">
                <Card className="h-full">
                    <div className="flex flex-col h-full justify-between items-start">
                        <div className="flex justify-start items-center">
                            <div className="mr-1">
                                <LightningBoltIcon color="yellow" />
                            </div>
                            <Text weight='bold' size='4'>
                                {title}
                            </Text>
                        </div>
                        <Text weight='light' size='1'>
                            {content}
                        </Text>
                        <div className="w-full flex justify-end">
                            <Button variant='ghost-no-hover' className="p-0 m-0" onClick={handleSuggestionClick}>
                                <div className="mr-1">
                                    <Text weight='light' size='1'>
                                        Prompt
                                    </Text>
                                </div>
                                <ArrowRightIcon />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}