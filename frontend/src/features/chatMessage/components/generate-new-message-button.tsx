import Cookies from "js-cookie";
import { api } from "@/lib/api-client";
import { useAddContentVariationMutation } from "@/features/chatMessage/api/add-content-variation";
import { AddContentVariationInput } from "@/features/chatMessage/api/add-content-variation";
import { AssistantMessage } from "@/types/api";
import { Button as LocalButton } from "@/components/ui/button";
import { SymbolIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const GenerateNewMessageButton: React.FC<{
  assistantMessage: AssistantMessage;
  conversationId: string;
}> = ({ assistantMessage, conversationId }) => {
  const { isError, mutate } = useAddContentVariationMutation({
    conversationId,
  });

  const [isLoading, setIsLoading] = useState(false);

  const toDataURL = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    const response = await fetch(url);
    const blob = await response.blob();
    console.log(blob);

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const base64String = base64Data.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleClick = async () => {
    setIsLoading(true);
    var assistantMessageId = assistantMessage.id;
    try {
      var payload = {
        model: assistantMessage.model.name,
        provider: assistantMessage.model.provider,
        messages: [
          {
            role: "user",
            content: assistantMessage.generated_by.content,
            images: []
          },
        ],
      };
      if (assistantMessage.generated_by.image) {
        payload["messages"][0]["images"] = [await toDataURL(assistantMessage.generated_by.image)]
      }
      console.log(payload)
      const response = await api.post("/chat/", payload, {
        headers: {
          Authorization: `Token ${Cookies.get("token")}`,
        },
      });

      const data: AddContentVariationInput = {
        new_content_variation: (response as any).message.content,
      };
      mutate({ assistantMessageId, data });
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating new message:", error);
    }
  };

  return (
    <LocalButton
      onClick={handleClick}
      variant={"ghost-no-hover"}
      className="mx-1 px-1 py-0 my-0"
    >
      <div className={isLoading ? "rotate" : ""}>
        <SymbolIcon />
      </div>
    </LocalButton>
  );
};

export default GenerateNewMessageButton;
