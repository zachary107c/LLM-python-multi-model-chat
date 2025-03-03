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
        variant="ghostNoHover"
        className="p-0 m-0 flex items-center h-full w-full rounded-md"
        onClick={handleSuggestionClick}
      >
        <div className="h-full w-full suggestion-border group">
          <Card className="h-full w-full p-2 bg-secondary rounded-md shadow-none">
            <div className="flex flex-col h-full justify-between items-start truncate gap-1">
              <div className="flex justify-start items-center gap-1">
                <Sparkles
                  size={15}
                  strokeWidth={1.5}
                  color="hsl(var(--foreground))"
                />
                <span className="text-md font-bold">{suggestion.bucket}</span>
              </div>
              <span className="">
                {suggestion.summary}
              </span>
              <div className="w-full flex justify-end items-center gap-1">
                <span className="text-sm">Prompt</span>
                <ChevronRight size={15} strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        </div>
      </Button>
    </div>
  );
}