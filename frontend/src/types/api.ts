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
}>;

export type AssistantMessage = Entity<{
  conversation: string;
  content: string;
  model: BaseModelEntity;
  provider: string;
  liked: boolean;
  type: string;
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
      content: string;
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
  preferred_model: BaseModelEntity;
};

export type UserProfile = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: Profile;
};

export type Suggestion = {
  bucket: string;
  question: string;
};

export type Suggestions = {
  suggestions: Suggestion[];
};

export type Provider = {
  id: number;
  name: string;
}