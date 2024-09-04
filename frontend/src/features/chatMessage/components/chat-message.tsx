import Panel from "@/components/ui/panel"

export function ChatMessage({ messageText, messageType }: any) {
    return (
        <div className={messageType === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <Panel title={messageType === 'user' ? 'You' : 'LLM'} text={messageText} role={messageType} />
        </div>
    );
}