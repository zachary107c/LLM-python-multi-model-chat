import * as z from "zod";

export type BaseEntity = {
    id: string;
    created_at: string;
};

export type BaseModelEntity = {
    id: number;
    name: string;
    model: string;
    liked: boolean;
    provider: string;
    color:
    | "gray"
    | "gold"
    | "bronze"
    | "brown"
    | "yellow"
    | "amber"
    | "orange"
    | "tomato"
    | "red"
    | "ruby"
    | "crimson"
    | "pink"
    | "plum"
    | "purple"
    | "violet"
    | "iris"
    | "indigo"
    | "blue"
    | "cyan"
    | "teal"
    | "jade"
    | "green"
    | "grass"
    | "lime"
    | "mint"
    | "sky";
};

export type ModelEntity<T> = {
    [K in keyof T]: T[K];
} & BaseModelEntity;

export type ModelDetails = {
  license: string;
  modelfile: string;
  parameters: string;
  template: string;
  system: string;
  modified_at: string;
};

export type ModelDetail = ModelEntity<{
  details: ModelDetails | null;
}>;


export type Settings = {
    preferred_model: BaseModelEntity | null;
    stream_responses: boolean;
    theme: string;
    use_message_history: boolean;
    message_history_count: number;
    use_tools: boolean;
}

export type Profile = {
    image: string;
    bio: string;
};

export type Entity<T> = {
    [K in keyof T]: T[K];
} & BaseEntity;

export type AuthResponse = {
    expiry: string;
    token: string;
}

export type RegisterAuthResponse = {
    message: string;
    expiry: string;
    token: string;
}

export type User = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: Profile,
    settings: Settings
}

export type Grouping = "Today" | "This Week" | "This Month" | "Old";

export type Conversation = Entity<{
    title: string;
    user: string;
    updatedAt: number;
    liked: boolean;
    grouping: Grouping;
}>;

export type GroupedConverations = {
    Today: Conversation[];
    "This Week": Conversation[];
    "This Month": Conversation[];
    Old: Conversation[];
};

export type UserMessage = Entity<{
    conversation: string;
    content: string;
    image: string | null;
    type: string;
    is_deleted: boolean;
    deleted_at: string;
    recoverable: string;
  }>;
  
  export type ContentVariation = {
    id: number;
    content: string;
  }
  
  export type Arguments = {
    [key: string]: any;
  };
  
  export type UsedTool = {
    name: string;
    arguments: Arguments;
  };
  
  export type AssistantMessage = Entity<{
    conversation: string;
    content_variations: ContentVariation[];
    generated_by: UserMessage;
    model: BaseModelEntity;
    provider: string;
    liked: boolean;
    type: string;
    is_deleted: boolean;
    deleted_at: string;
    recoverable: boolean;
    tools_used: UsedTool[] | null;
  }>;
  
  export type Message = UserMessage | AssistantMessage;

  export type ConversationDetailMessage = Entity<
  | {
    content_variations: ContentVariation[];
    type: string;
    model: BaseModelEntity;
    provider: string;
    liked: boolean;
  }
  | {
    content: string;
    type: string;
    image: string | null;
  }
>;

export type ConversationDetail = {
  title: string;
  user: string;
  updatedAt: number;
  liked: boolean;
  messages: ConversationDetailMessage[];
};

export type Suggestion = {
  bucket: string;
  summary: string;
  question: string;
};

export type Suggestions = {
  suggestions: Suggestion[];
};

export type Provider = {
  id: number;
  name: string;
};
