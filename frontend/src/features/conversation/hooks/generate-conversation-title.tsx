import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import { useState } from "react";
import { api } from "@/lib/api-client";

interface MagicTitleResponse {
  magic_title: string;
}


export const useConversationalTitleGenerator = (conversationId: string) => {
  const {
    data,
    error: queryError,
    isLoading: isQueryLoading,
  } = useGetConversationQuery({ conversationId });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONVERSATION_TITLE_GENERATION_DELAY_MS = 500;

  const generateConversationTitle = async (): Promise<string> => {
    if (!data) return "";

    try {
      setIsLoading(true);

      await sleep(CONVERSATION_TITLE_GENERATION_DELAY_MS);

      let magicTitleResponse = await api.post<MagicTitleResponse>("/magic", {
        model:  "gpt-4o-mini",
        provider: "openai",
        conversation: conversationId
      });

      return magicTitleResponse.magic_title;
    } catch (err) {
      setError("Failed to generate a title.");
      console.error(err);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  return {
    generateConversationTitle,
    isLoading: isQueryLoading || isLoading,
    error: queryError || error,
  };
};
