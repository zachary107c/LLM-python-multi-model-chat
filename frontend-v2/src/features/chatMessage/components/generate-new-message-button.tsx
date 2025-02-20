import { api } from "@/lib/api-client";
import { useAddContentVariationMutation } from "@/features/chatMessage/api/add-content-variation";
import { AddContentVariationInput } from "@/features/chatMessage/api/add-content-variation";
import { AssistantMessage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { RotateCwIcon as SymbolIcon } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/auth";
import { env } from "@/config/env";

const GenerateNewMessageButton: React.FC<{
  assistantMessage: AssistantMessage;
  conversationId: string;
  onUpdateContent: (newContent: string) => void;
  onRegenerate: () => void;
  onStreamComplete: (finalContent: string) => void;
}> = ({
  assistantMessage,
  conversationId,
  onUpdateContent,
  onRegenerate,
  onStreamComplete,
}) => {
  const { mutate } = useAddContentVariationMutation({
    conversationId,
  });
  const userSettings =  useUser();
  const [isLoading, setIsLoading] = useState(false);

  const toDataURL = async (
    url: string | null
  ): Promise<{ base64: string; type: string } | null> => {
    if (!url) return null;

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<{ base64: string; type: string }>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result as string;

        // Extract the MIME type and base64 string
        const [header, base64String] = base64Data.split(",");
        const typeMatch = header.match(/:(.*?);/);

        if (typeMatch) {
          const mimeType = typeMatch[1];
          resolve({ base64: base64String, type: mimeType });
        } else {
          reject(new Error("Failed to extract MIME type"));
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleClick = async () => {
    setIsLoading(true);
    onRegenerate();
    const assistantMessageId = assistantMessage.id;

    try {
      const image_data = assistantMessage.generated_by.image
        ? await toDataURL(assistantMessage.generated_by.image)
        : null;

      const payload = {
        model: assistantMessage.model?.model,
        provider: assistantMessage.model?.provider,
        conversation: assistantMessage.conversation,
        messages: [
          {
            role: "user",
            content: "",
          } as { role: string; content: string | any[]; images?: string[] },
        ],
      };

      if (image_data) {
        if (assistantMessage.model?.provider === "ollama") {
          payload.messages[0]["images"] = [image_data.base64];
          payload.messages[0].content = assistantMessage.generated_by.content;
        } else if (assistantMessage.model?.provider === "openai") {
          let text_part = { type: "text", text: assistantMessage.generated_by.content };
          let image_part = {
            type: "image_url",
            image_url: {
              url: `data:${image_data.type};base64,${image_data.base64}`,
            },
          };
          payload.messages[0].content = [text_part, image_part];
        }
      } else {
        payload.messages[0].content = assistantMessage.generated_by.content;
      }

      if (userSettings.data?.settings?.stream_responses) {
        const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        let accumulatedContent = "";
        const reader = response.body?.getReader();

        while (true) {
          const { done, value } = (await reader?.read()) || {
            done: true,
            value: undefined,
          };

          if (done) {
            // Stream is complete
            onStreamComplete(accumulatedContent);
            const data: AddContentVariationInput = {
              new_content_variation: accumulatedContent,
            };
            mutate({ assistantMessageId, data });
            setIsLoading(false);
            break;
          }

          const decoded = new TextDecoder().decode(value);
          const lines = decoded.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              try {
                const jsonStr = line.slice(6); // Remove "data: " prefix
                const data = JSON.parse(jsonStr);
                if (data.message?.content) {
                  accumulatedContent += data.message.content;
                  onUpdateContent(accumulatedContent);
                }
              } catch (e) {
                console.error("Error parsing streaming data:", e);
              }
            }
          }
        }
      } else {
        // Non-streaming response
        const response = await api.post("/chat/", payload);

        const content = (response as any).message.content;
        onStreamComplete(content);
        const data: AddContentVariationInput = {
          new_content_variation: content,
        };
        mutate({ assistantMessageId, data });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error generating new message:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghostNoHover"
      className="m-0 p-0"
      disabled={assistantMessage.generated_by.is_deleted}
    >
      <div className={isLoading ? "rotate" : ""}>
        <SymbolIcon />
      </div>
    </Button>
  );
};

export default GenerateNewMessageButton;
