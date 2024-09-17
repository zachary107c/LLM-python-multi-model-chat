export type BaseEntity = {
    id: string;
    createdAt: number;
};

export type Entity<T> = {
    [K in keyof T]: T[K];
} & BaseEntity;


export type UserMessage = Entity<{
    conversation: number;
    content: string;
}>;

export type AssistantMessage = Entity<{
    conversation: number;
    content: string;
    model: string;
    provider: string;
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
}>;

export type ConversationDetail = {
    title: string;
    user: string;
    updatedAt: number;
    messages: ConversationDetailMessage[];
};



