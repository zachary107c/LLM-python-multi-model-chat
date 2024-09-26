import { useEffect, useState } from "react";
import { AlertDialog, Flex, Button, Card } from "@radix-ui/themes";
import { Button as LocalButton } from '@/components/ui/button';
import { Pencil2Icon } from '@radix-ui/react-icons'; // Add this if not already imported
import { updateProfileMutation } from "../api/update-profile";


export function UpdateProfileModal() {
    const updateMutation = updateProfileMutation();


    const handleUpdate = async () => {
        console.log("ERM");
    };

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <LocalButton variant='ghost' className="p-2 flex justify-start">
                    <Pencil2Icon className="mr-2" />
                    <div className="">
                        Edit Profile
                    </div>
                </LocalButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content size='1'>
                <AlertDialog.Title size='2'>Edit Profile</AlertDialog.Title>
                <Card className='w-full flex justify-between items-center'
                    style={{
                        '--base-card-padding-top': 'var(--space-1)',
                        '--base-card-padding-bottom': 'var(--space-1)',
                        '--base-card-padding-left': 'var(--space-2)',
                        '--base-card-padding-right': 'var(--space-2)',
                    } as any} size="1" variant='surface'>

                    <h1>COCK</h1>
                </Card>
                <Flex gap="3" mt="4" justify="between">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray" size='1'>
                            Close
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="green" onClick={() => handleUpdate()} size='1'>
                            Update Profile
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}