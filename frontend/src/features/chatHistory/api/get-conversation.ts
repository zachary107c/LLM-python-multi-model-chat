import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { ConversationDetail } from '@/types/api';
import Cookies from 'js-cookie';

// Schema to validate input
export const getConversationInputSchema = z.object({
  conversationId: z.string(),
});

export type GetConversationInput = z.infer<typeof getConversationInputSchema>;

// A custom hook for fetching conversation by ID
export const useGetConversationQuery = ({ conversationId }: GetConversationInput) => {
  return useQuery({
    // Dynamic query key based on conversationId for unique queries
    queryKey: ['conversation', conversationId],
    
    // Fetcher function to get the conversation
    queryFn: async () => {
      const response = await api.get(`/conversations/${conversationId}/`, {
        headers: {
          Authorization: `Token ${Cookies.get('token')}`,
        },
      });
      // Parse response data to expected type
      return response.data as ConversationDetail;
    },
    
    // Optional: You could specify how often the data should be refetched
    staleTime: 1000 * 60 * 5, // e.g., 5 minutes (optional)
  });
};