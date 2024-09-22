import { Card, Text, Badge } from "@radix-ui/themes";
import MarkdownRenderer from "@/features/markdown/components/markdown";


export default function Panel({ title, role, name, text, children }: any) {
    return (
        <div>
            {(title) && (
                <div className={`mb-1 flex ${role === 'user' ? 'justify-end' : 'justify-start'} items-center`}>
                    {(name !== "user" && name !== undefined && name !== '' && name !== null) && (<Badge variant='surface' color="plum">{name}</Badge>)}
                </div>)}
            <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className="w-fit">
                    <div>
                        <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
                            {
                                (text)
                                &&
                                (
                                    <Text size='2'>
                                        <MarkdownRenderer markdown={text} />
                                    </Text>
                                )
                            }
                            {children}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}