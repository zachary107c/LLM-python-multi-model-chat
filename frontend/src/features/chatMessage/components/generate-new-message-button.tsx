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
          },
        ],
      };
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
