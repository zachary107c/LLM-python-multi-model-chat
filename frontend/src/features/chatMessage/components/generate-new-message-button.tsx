// import Cookies from "js-cookie";
// import { api } from "@/lib/api-client";
// import { useAddContentVariationMutation } from "@/features/chatMessage/api/add-content-variation";
// import { AddContentVariationInput } from "@/features/chatMessage/api/add-content-variation";
// import { AssistantMessage } from "@/types/api";
// import { Button as LocalButton } from "@/components/ui/button";
// import { SymbolIcon } from "@radix-ui/react-icons";
// import { useState } from "react";
// import { useUserSettings } from "@/components/userSettings/user-settings-provider";
// import { env } from "@/config/env";

// const GenerateNewMessageButton: React.FC<{
//   assistantMessage: AssistantMessage;
//   conversationId: string;
//   onUpdateContent: (newContent: string) => void;
//   onRegenerate: () => void;
// }> = ({ assistantMessage, conversationId, onUpdateContent, onRegenerate }) => {
//   const { mutate } = useAddContentVariationMutation({
//     conversationId,
//   });
//   const { userSettings } = useUserSettings();

//   const [isLoading, setIsLoading] = useState(false);

//   const toDataURL = async (url: string | null): Promise<string | null> => {
//     if (!url) return null;
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new Promise<string>((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const base64Data = reader.result as string;
//         const base64String = base64Data.split(",")[1];
//         resolve(base64String);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   const handleClick = async () => {
//     setIsLoading(true);
//     onRegenerate();
//     const assistantMessageId = assistantMessage.id;
//     try {
//       const imageData = assistantMessage.generated_by.image ? [await toDataURL(assistantMessage.generated_by.image)] : [];

//       const payload = {
//         model: assistantMessage.model.name,
//         provider: assistantMessage.model.provider,
//         messages: [
//           {
//             role: "user",
//             content: assistantMessage.generated_by.content,
//             images: imageData,
//           },
//         ],
//       };

//       if (userSettings.settings?.stream_responses) {
//         const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
//           method: "POST",
//           headers: {
//             Authorization: `Token ${Cookies.get("token")}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//           credentials: "include",
//         });

//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         let accumulatedContent = "";

//         const stream = new ReadableStream({
//           start(controller) {
//             const reader = response.body?.getReader();
//             function pump() {
//               return reader?.read().then(({ done, value }) => {
//                 if (done) {
//                   controller.close();
//                   // Once streaming is done, mutate with the accumulated content
//                   const data: AddContentVariationInput = {
//                     new_content_variation: accumulatedContent,
//                   };
//                   mutate({ assistantMessageId, data });
//                   setIsLoading(false);
//                   return;
//                 }

//                 const decoded = new TextDecoder().decode(value);
//                 const lines = decoded.split("\n");

//                 for (const line of lines) {
//                   if (line.trim()) {
//                     const jsonStr = line.slice(6);
//                     const data = JSON.parse(jsonStr);
//                     if (data.message?.content) {
//                       accumulatedContent += data.message.content;
//                       onUpdateContent(accumulatedContent);
//                     }
//                   }
//                 }
//                 pump();
//               });
//             }
//             return pump();
//           },
//         });

//         await new Response(stream).text();

//       } else {
//         const response = await api.post("/chat/", payload, {
//           headers: {
//             Authorization: `Token ${Cookies.get("token")}`,
//           },
//         });

//         const data: AddContentVariationInput = {
//           new_content_variation: (response as any).message.content,
//         };
//         mutate({ assistantMessageId, data });
//         setIsLoading(false);
//       }

//     } catch (error) {
//       console.error("Error generating new message:", error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <LocalButton
//       onClick={handleClick}
//       variant={"ghost-no-hover"}
//       className="mx-1 px-1 py-0 my-0"
//     >
//       <div className={isLoading ? "rotate" : ""}>
//         <SymbolIcon />
//       </div>
//     </LocalButton>
//   );
// };

// export default GenerateNewMessageButton;
import Cookies from "js-cookie";
import { api } from "@/lib/api-client";
import { useAddContentVariationMutation } from "@/features/chatMessage/api/add-content-variation";
import { AddContentVariationInput } from "@/features/chatMessage/api/add-content-variation";
import { AssistantMessage } from "@/types/api";
import { Button as LocalButton } from "@/components/ui/button";
import { SymbolIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useUserSettings } from "@/components/userSettings/user-settings-provider";
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
  const { userSettings } = useUserSettings();
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
        model: assistantMessage.model?.name,
        provider: assistantMessage.model?.provider,
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

      if (userSettings.settings?.stream_responses) {
        const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
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
        const response = await api.post("/chat/", payload, {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        });

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
    <LocalButton
      onClick={handleClick}
      variant="ghost-no-hover"
      className="mx-1 px-1 py-0 my-0"
      disabled={assistantMessage.generated_by.is_deleted}
    >
      <div className={isLoading ? "rotate" : ""}>
        <SymbolIcon />
      </div>
    </LocalButton>
  );
};

export default GenerateNewMessageButton;
