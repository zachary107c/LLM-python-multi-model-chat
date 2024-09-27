import { AlertDialog, Flex, Button, Avatar } from "@radix-ui/themes";
import { Button as LocalButton } from '@/components/ui/button';

interface ImageExpandModalProps {
    imagePath: string;
}

export function ImageExpandModal({ imagePath }: ImageExpandModalProps) {
    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <LocalButton variant={"ghost-no-hover"} className="mx-1 px-1 py-0 my-0">
                    <Avatar src={imagePath} size="1" fallback="I" />
                </LocalButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content size='1'>
                <div className="flex flex-col justify-start">
                    <img
                        src={imagePath}
                        style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                            borderRadius: 'var(--radius-2)',
                        }}
                    />
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray" size='1'>
                            Close
                        </Button>
                    </AlertDialog.Cancel>
                </div>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}