import { Card, Text } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";
import { Suggestion } from "@/types/api";

interface WelcomeCardProps {
  suggestion: Suggestion;
  handleMessageSend: (message: string) => void;
}

export function WelcomeCard({
  suggestion,
  handleMessageSend,
}: WelcomeCardProps) {
  function handleSuggestionClick() {
    handleMessageSend(suggestion.question);
  }

  return (
    <div className="p-1 w-full max-w-sm h-28 overflow-hidden no-scrollbar">
      <Button
        variant="ghost-no-hover"
        className="p-0 m-0 flex items-center h-full w-full"
        onClick={handleSuggestionClick}
      >
        <div className="rainbow-border h-full w-full">
          <Card className="h-full w-full">
            <div className="flex flex-col h-full justify-between items-start">
              <div className="flex justify-start items-center">
                <div className="mr-1 sparkles">
                  <Sparkles size={15} strokeWidth={1.5} color="yellow" />
                </div>
                <Text weight="bold" size="4">
                  {suggestion.bucket}
                </Text>
              </div>
              <Text weight="light" size="1" className="flex-grow">
                {suggestion.summary}
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