import { Card, Text, Heading, Inset, Button, Badge } from "@radix-ui/themes";
import MarkdownRenderer from "../utils/markdown";


export default function Panel({ title, role, text, children }: any) {
    return (
        <Card className='mb-2 ' variant='surface'>
            {(title) && (
                <div className={`mb-2 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Badge variant='surface' color={role === 'user' ? 'iris' : 'gray'}>{title}</Badge>
                </div>)}
            <div>
                <div className="font-work-sans overflow-y-scroll overflow-x-scroll no-scrollbar">
                    {(text) && (
                        <Text size='2'>
                            <MarkdownRenderer markdown={text} />
                        </Text>
                    )
                    }
                    {children}
                </div>
            </div>
        </Card>
    );
}