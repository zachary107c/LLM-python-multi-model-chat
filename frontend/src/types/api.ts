export type BaseEntity = {
  id: string;
  created_at: string;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

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
}>;

export type Message = UserMessage | AssistantMessage;

export type AuthResponse = {
  token: string;
  expiry: number;
};

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

export type GenerateConversationTitle = {
  generatedTitle: string;
};

export type Profile = {
  image: string;
  bio: string;
};

export type Settings = {
  preferred_model: BaseModelEntity;
  stream_responses: boolean;
  theme: string;
  use_message_history: boolean;
  message_history_count: number;
  use_tools: boolean;
}

export type UserSettings = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
  settings: Settings;
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
}

export type UserSettingsUpdatePayload = {
  username?: string;
  email?: string;
  profile?: { image?: string; bio?: string };
  settings?: {
    preferred_model: number
    stream_responses?: boolean;
    theme?: string;
    use_message_history?: boolean;
    message_history_count?: number;
    use_tools?: boolean;
  };
};

export type Tool = Entity<{
  updated_at: string;
  name: string;
  description: string;
  script: string;
  user: string;
}>;