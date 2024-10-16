import { Card, Text } from "@radix-ui/themes";
import { Button } from "@/components/navigation/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";

interface WelcomeCardProps {
  title: string;
  content: string;
  handleMessageSend: (message: string) => void;
}

export function WelcomeCard({
  title,
  content,
  handleMessageSend,
}: WelcomeCardProps) {
  function handleSuggestionClick() {
    handleMessageSend(content);
  }

  return (
    <div className="p-1 w-full h-32 overflow-y-scroll no-scrollbar">
      <Button
        variant="ghost-no-hover"
        className="p-0 m-0 flex items-center h-full w-full text-wrap"
        onClick={handleSuggestionClick}
      >
        <div className="rainbow-border h-full">
          <Card className="h-full">
            <div className="flex flex-col h-full justify-between items-start">
              <div className="flex justify-start items-center">
                <div className="mr-1 sparkles">
                  <Sparkles size={15} strokeWidth={1.5} color="yellow" />
                </div>
                <Text weight="bold" size="4">
                  {title}
                </Text>
              </div>
              <Text weight="light" size="1" className="">
                {content}
              </Text>
              <div className="w-full flex justify-end items-center">
                <div className="mr-1">
                  <Text weight="light" size="1">
                    Prompt
                  </Text>
                </div>
                <ChevronRight size={15} strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        </div>
      </Button>
    </div>
  );
}
