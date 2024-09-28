import { AlertDialog, Button, Avatar, Badge, Inset } from "@radix-ui/themes";
import { Button as LocalButton } from '@/components/ui/button';

interface ImageExpandModalProps {
    imagePath: string;
}

export function ImageExpandModal({ imagePath }: ImageExpandModalProps) {
    return (
        <Inset clip="padding-box" side="top" pb="current">
            <AlertDialog.Root>
                <AlertDialog.Trigger>
                    <LocalButton variant={"ghost-no-hover"} className="p-0 m-0 w-full">
                        <img
                            src={imagePath}
                            alt="Bold typography"
                            style={{
                                display: 'block',
                                objectFit: 'cover',
                                width: '100%',
                                height: 140,
                                backgroundColor: 'var(--gray-5)',
                            }}
                        />
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
                            <Button variant='outline' color="gray" size='1'>
                                Close
                            </Button>
                        </AlertDialog.Cancel>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Inset >
    );
}