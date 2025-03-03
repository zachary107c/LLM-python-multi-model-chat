import { Button } from "@/components/ui/button";
import { updateConversationMutation } from "../api/update-conversation";
import { useConversationalTitleGenerator } from "@/features/conversation/hooks/generate-conversation-title";
import { MoonLoader } from "react-spinners";
import { WandSparkles } from "lucide-react";

interface MagicTitleModalProps {
  conversationId: string;
}

export function MagicTitleButton({ conversationId }: MagicTitleModalProps) {
  const updateMutation = updateConversationMutation();
  const { generateConversationTitle, isLoading } =
    useConversationalTitleGenerator(conversationId);

  const handleUpdate = async (title: string) => {
    try {
      await updateMutation.mutateAsync({
        data: { conversationId: conversationId, updates: { title: title } },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleGenerateAiTitle = async () => {
    var title = await generateConversationTitle();
    handleUpdate(title);
  };

  return (
    <Button
      variant="ghost"
      className="p-2 w-full flex gap-4 justify-start"
      onClick={async () => handleGenerateAiTitle()}
    >
      { isLoading ? (<MoonLoader size={12} color="hsl(var(--primary))"/>) : (<WandSparkles size={15} />)}
      <div className="text-left">Magic Title™</div>
    </Button>
  );
}
