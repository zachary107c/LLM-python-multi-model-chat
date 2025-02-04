import { Card } from "@/components/ui/card";
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
        variant="ghost"
        className="p-0 m-0 flex items-center h-full w-full"
        onClick={handleSuggestionClick}
      >
        <div className="rainbow-border h-full w-full">
          <Card className="h-full w-full p-4">
            <div className="flex flex-col h-full justify-between items-start">
              <div className="flex justify-start items-center">
                <div className="mr-1 sparkles">
                  <Sparkles size={15} strokeWidth={1.5} color="yellow" />
                </div>
                <span className="text-lg font-bold">
                  {suggestion.bucket}
                </span>
              </div>
              <span className="flex-grow text-xs font-light">
                {suggestion.summary}
              </span>
              <div className="w-full flex justify-end items-center">
                <div className="mr-1">
                  <span className="text-sm font-light">
                    Prompt
                  </span>
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