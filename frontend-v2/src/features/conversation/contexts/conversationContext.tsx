import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

type ConversationContextType = {
  conversationId: string;
  setConversationId: (id: string) => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversationId, setConversationId] = useState<string>(searchParams.get('c') || '');

  useEffect(() => {
    const id = searchParams.get('c');
    if (id) {
      setConversationId(id);
    }
  }, [searchParams]);

  const handleSetConversationId = (id: string) => {
    setConversationId(id);
    setSearchParams({ c: id });
  };

  return (
    <ConversationContext.Provider value={{ conversationId, setConversationId: handleSetConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationId = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationId must be used within a ConversationProvider');
  }
  return context;
};