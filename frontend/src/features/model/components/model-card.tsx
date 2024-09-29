import { Badge, Card } from "@radix-ui/themes";

interface ModelCardProps {
    model: string;
    name: string;
    color: 'gray' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber' | 'orange' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime' | 'mint' | 'sky';
}


export function ModelCard({ model, name, color }: ModelCardProps) {
    return (
        <div className="p-1 w-full">
            <Card>
                <Badge color={color} variant='surface'>
                    {model} - {name}
                </Badge>
            </Card>
        </div>
    );
}