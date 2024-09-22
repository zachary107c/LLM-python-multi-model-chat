import { useQuery } from "@tanstack/react-query";
import { api } from '@/lib/api-client';
import { Model, GenerateConversationTitle } from '@/types/api';
import Cookies from 'js-cookie';
import { z } from 'zod';
import axios from 'axios';
import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";

export const generateConversationTitleInputSchema = z.object({
    conversationId: z.string(),
});

export type GenerateConversationTitleInput = z.infer<typeof generateConversationTitleInputSchema>;

export const generateConversationTitle = async ({ conversationId }: GenerateConversationTitleInput) => {
    const { data, error, isLoading } = useGetConversationQuery({ conversationId: conversationId });
    if (data) {
        var messages = data.messages;
        var prompt = 'Given the following messages in a conversation, generate a title for the conversation, keep it short, use emojis:\n';
        messages.forEach(message => {
            prompt += `${message.type}: ${message.content}\n`;
        });
        var payload = {
            model: "llama3.1",
            messages: [{ role: "user", content: prompt }],
            stream: false,
        }
        const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
        console.log(response);
    }
}