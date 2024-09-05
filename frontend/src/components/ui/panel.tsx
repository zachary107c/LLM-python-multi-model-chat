import { Card, Text, Heading, Inset, Button, Badge } from "@radix-ui/themes";
import MarkdownRenderer from "../utils/markdown";


export default function Panel({ title, role, text, children }: any) {
    return (
        <div>
            {(title) && (
            <div className={`mb-1 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Badge variant='surface' color={role === 'user' ? 'green' : 'gray'}>{title}</Badge>
            </div>)}
            <Card className='mb-2'>
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
        </div>
    );
}