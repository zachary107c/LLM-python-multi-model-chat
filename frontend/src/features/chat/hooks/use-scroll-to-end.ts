import { useEffect, useRef } from 'react';
import { Message } from '@/features/chat/components/chat';

const useScrollToEnd = (messages: Message[]) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return ref;
};

export default useScrollToEnd;