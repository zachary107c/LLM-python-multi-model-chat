import { api } from '@/lib/api-client';
import { AssistantMessage } from '@/types/api';
import Cookies from 'js-cookie';

export const getAssistantMessage = ({
    messageId,
}: {
    messageId: string;
}): Promise<{ data: AssistantMessage }> => {
    return api.get(`/messages/assistant/${messageId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
