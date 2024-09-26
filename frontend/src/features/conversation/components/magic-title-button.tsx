import { Button } from '@/components/ui/button';
import { MagicWandIcon } from '@radix-ui/react-icons';
import { updateConversationMutation } from "../api/update-conversation";
import { useConversationalTitleGenerator } from "@/features/conversation/hooks/generate-conversation-title";
import { BarLoader } from 'react-spinners';


interface MagicTitleModalProps {
    conversationId: string;
}

export function MagicTitleButton({ conversationId }: MagicTitleModalProps) {
    const updateMutation = updateConversationMutation();
    const { generateConversationTitle, isLoading, error } = useConversationalTitleGenerator(conversationId);

    const handleUpdate = async (title: string) => {
        try {
            await updateMutation.mutateAsync({ data: { conversationId: conversationId, updates: { title: title } } });
        } catch (e) {
            console.log(e);
        }
    };

    const handleGenerateAiTitle = async () => {
        var title = await generateConversationTitle();
        handleUpdate(title);
    }

    return (
        <Button variant='ghost' className="p-2 w-full flex justify-start" onClick={async () => handleGenerateAiTitle()}>
            {isLoading ? (
                <div className='w-full'>
                    <BarLoader width={'100%'} color='#484848'/>
                </div>
            ) : (
                <>
                    <MagicWandIcon className="mr-2" color='yellow'/>
                    <div className="w-full">
                        Magic Title
                    </div>
                </>
            )}
        </Button>
    );
}