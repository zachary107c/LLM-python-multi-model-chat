import { WelcomeCard } from "./welcome-card";
import { useUser } from "@/lib/auth";
import { useGetSuggestionsQuery } from "../api/get-three-suggestions";
import { WelcomeCardLoading } from "./welcome-card-loading";

interface WelcomeProps {
  handleMessageSend: any;
}

export function Welcome({ handleMessageSend }: WelcomeProps) {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: suggestionsData, isLoading: suggestionsLoading } =
    useGetSuggestionsQuery(3);

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 h-full items-start justify-center">
        <span className="text-seconday/50 font-bold title mask-text text-4xl">
          bruh.
        </span>
        {user && (
          <span className="text-2xl text-secondary-foreground">
            Welcome, {user.username}
          </span>
        )}
        <div className="flex justify-between items-center w-full">
          {suggestionsLoading && (
            <>
              <WelcomeCardLoading />
              <WelcomeCardLoading />
              <WelcomeCardLoading />
            </>
          )}
          {suggestionsData &&
            suggestionsData.suggestions.map((suggestion) => {
              return (
                <WelcomeCard
                  suggestion={suggestion}
                  handleMessageSend={handleMessageSend}
                  key={suggestion.bucket + suggestion.question}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
