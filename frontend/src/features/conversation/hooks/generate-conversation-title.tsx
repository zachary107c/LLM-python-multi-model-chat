import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import axios from "axios";
import { useState } from "react";

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

      var prompt = "CONVERSATION:\n";
      data.messages.forEach((message) => {
        if (message.type === "user") {
          if ("content" in message) {
            prompt += `${message.type.toUpperCase()} MESSAGE: ${
              message.content
            }\n\n`;
          }
        } else if (message.type === "assistant") {
          if ("content_variations" in message) {
            const lastIndex = message.content_variations.length - 1;
            prompt += `${message.type.toUpperCase()} MESSAGE: ${
              message.content_variations[lastIndex].content
            }\n\n`;
          }
        }
      });

      const summaryPayload = {
        model: "llama3.1",
        messages: [
          {
            role: "system",
            content:
              "Create a summary of the following conversation. Return only the summary, no other text or markdown.",
          },
          { role: "user", content: prompt },
        ],
        stream: false,
      };

      const summaryResponse = await axios.post(
        "http://192.168.1.11:11434/api/chat",
        summaryPayload
      );
      const summary = summaryResponse.data.message.content.replace(/"/g, "");

      const payload = {
        model: "llama3.1",
        messages: [
          {
            role: "system",
            content:
              "Generate a concise, creative title for the following conversation using the provided summary. Always start and end the title with an emoji. Return only the title, no other text or markdown. Always return text. If there is no conversation, make a random title.",
          },
          { role: "user", content: summary },
        ],
        stream: false,
      };

      const response = await axios.post(
        "http://192.168.1.11:11434/api/chat",
        payload
      );
      return response.data.message.content.replace(/"/g, "");
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
