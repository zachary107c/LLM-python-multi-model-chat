import { Color } from '@/types/color'
import { Badge, Select, Text } from '@radix-ui/themes'

interface ColorPickerProps {
    outerColor: Color
    setOuterColor: (color: Color) => void
}

const colors: Color[] = [
    'gray',
    'gold',
    'bronze',
    'brown',
    'yellow',
    'amber',
    'orange',
    'tomato',
    'red',
    'ruby',
    'crimson',
    'pink',
    'plum',
    'purple',
    'violet',
    'iris',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'jade',
    'green',
    'grass',
    'lime',
    'mint',
    'sky',
]

export function ColorPicker({ outerColor, setOuterColor }: ColorPickerProps) {
    return (
        <div className='w-full flex items-center'>
            <div className="mr-2">
                <Text weight='bold'>New Color</Text>
            </div>
            <Select.Root defaultValue={outerColor} onValueChange={(value) => setOuterColor(value as Color)}>
                <Select.Trigger />
                <Select.Content variant='soft'>
                    {colors.map((c) => (
                        <Select.Item className='w-full' value={c} key={c}>
                            <Badge className='w-full' color={c} variant='surface'>{c}</Badge>
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </div >
    );
}