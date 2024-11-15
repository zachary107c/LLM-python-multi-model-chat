import { WelcomeCard } from "./welcome-card";
import { Suggestion } from "@/types/api";

interface WelcomeProps {
  suggestions: Suggestion[];
  handleMessageSend: any;
}

export function Welcome({ suggestions, handleMessageSend }: WelcomeProps) {
  return (
    <div className="w-full h-full">
      <div className="h-full flex justify-between items-center">
        {suggestions.map((suggestion) => {
          return (
            <WelcomeCard
              title={suggestion.bucket}
              content={suggestion.question}
              handleMessageSend={handleMessageSend}
              key={suggestion.bucket + suggestion.question}
            />
          );
        })}
      </div>
    </div>
  );
}
