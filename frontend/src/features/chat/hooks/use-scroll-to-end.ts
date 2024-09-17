import { useEffect, useRef } from 'react';
import { ConverstaionDetailMessage } from '@/types/api';

const useScrollToEnd = (messages: ConverstaionDetailMessage[]) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth'});
    }, [messages]);

    return ref;
};

export default useScrollToEnd;