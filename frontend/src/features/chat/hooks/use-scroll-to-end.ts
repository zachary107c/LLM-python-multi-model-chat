import { useEffect, useRef } from 'react';
import { ConversationDetailMessage } from '@/types/api';

const useScrollToEnd = (messages: ConversationDetailMessage[]) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth'});
    }, [messages]);

    return ref;
};

export default useScrollToEnd;