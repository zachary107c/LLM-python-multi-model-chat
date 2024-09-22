import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import axios from 'axios';
import { useState } from "react";

export const useGenerateConversationTitle = (conversationId: string) => {
    const { data, error: queryError, isLoading: isQueryLoading } = useGetConversationQuery({ conversationId });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const generateConversationTitle = async (): Promise<string> => {
        if (!data) {
            return '';
        }

        try {
            setIsLoading(true);
            await sleep(1000);
            var prompt = 'Generate a concise, creative title for the following conversation using relevant keywords and up to two emojis. Always start and end the title with an emoji. Return only the title, no other text or markdown.\nCONVERSATION:\n';
            data.messages.forEach(message => {
                prompt += `${message.type}: ${message.content}\n`;
            });

            const payload = {
                model: "llama3.1",
                messages: [{ role: "user", content: prompt }],
                stream: false,
            };

            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            return response.data.message.content.replace(/"/g, "");
        } catch (err) {
            setError("Failed to generate a title.");
            console.error(err);
            return '';
        } finally {
            setIsLoading(false);
        }
    };

    return { generateConversationTitle, isLoading: isQueryLoading || isLoading, error: queryError || error };
};