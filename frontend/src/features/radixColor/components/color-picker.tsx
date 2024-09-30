import { Color } from '@/types/color'
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { Badge, Button, DropdownMenu } from '@radix-ui/themes'

interface ColorPickerProps {
    color: Color
    setColor: (color: Color) => void
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

export function ColorPicker({ color, setColor }: ColorPickerProps) {
    return (
        <div className='w-full'>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant="surface">
                        Colors
                        <DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className='w-full'>
                    {colors.map((c) => (
                        <DropdownMenuItem className='w-full'>
                            <Button className='w-full' key={c} onClick={() => setColor(c)} variant='ghost'>
                                <Badge className='w-full' color={c} variant='surface'>{c}</Badge>
                            </Button>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    );
}