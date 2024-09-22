export type BaseEntity = {
    id: string;
    createdAt: number;
};

export type Entity<T> = {
    [K in keyof T]: T[K];
} & BaseEntity;


export type UserMessage = Entity<{
    conversation: string;
    content: string;
}>;

export type AssistantMessage = Entity<{
    conversation: string;
    content: string;
    model: string;
    provider: string;
    liked: boolean;
}>;

export type AuthResponse = {
    token: string;
    expiry: number;
};

export type Conversation = Entity<{
    title: string;
    user: string;
    updatedAt: number;
}>;

export type ConversationDetailMessage = Entity<{
    content: string;
    type: string;
    model?: string;
    provider?: string;
    liked?: boolean;
}>;

export type ConversationDetail = {
    title: string;
    user: string;
    updatedAt: number;
    messages: ConversationDetailMessage[];
};

export type Model = {
    id: number;
    name: string;
    model: string;
    liked: boolean;
}

export type GenerateConversationTitle = {
    generatedTitle: string;
}

