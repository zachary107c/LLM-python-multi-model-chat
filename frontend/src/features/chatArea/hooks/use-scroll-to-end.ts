import { useEffect, useRef } from "react";
import { AssistantMessage, UserMessage } from "@/types/api";

const useScrollToEnd = (messages: (UserMessage | AssistantMessage)[]) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  return ref;
};

export default useScrollToEnd;
