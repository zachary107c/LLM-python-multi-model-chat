export type BaseEntity = {
    id: string;
    createdAt: string;
};

export type Entity<T> = {
    [K in keyof T]: T[K];
} & BaseEntity;


export type UserMessage = Entity<{
    conversation: string;
    content: string;
    image: string | null;
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
    liked: boolean;
}>;

export type ConversationDetailMessage = Entity<{
    content: string;
    type: string;
    model?: string;
    provider?: string;
    liked?: boolean;
    image: string | null;
}>;

export type ConversationDetail = {
    title: string;
    user: string;
    updatedAt: number;
    liked: boolean;
    messages: ConversationDetailMessage[];
};

export type Model = {
    id: number;
    name: string;
    model: string;
    liked: boolean;
    color: 'gray' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber' | 'orange' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime' | 'mint' | 'sky';
}

export type GenerateConversationTitle = {
    generatedTitle: string;
}

export type Profile = {
    "image": string,
    "bio": string,
    "preferred_model": Model,
}

export type UserProfile = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: Profile;
}


