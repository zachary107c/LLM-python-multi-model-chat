import { api } from '@/lib/api-client';
import { UserMessage } from '@/types/api';
import Cookies from 'js-cookie';

export const getUserMessage = ({
    messageId,
}: {
    messageId: string;
}): Promise<{ data: UserMessage }> => {
    return api.get(`/messages/user/${messageId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
