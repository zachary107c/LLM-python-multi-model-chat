import { Card, Text } from "@radix-ui/themes";

export default function Panel({ title, centered, children }: any) {
    return (
        <Card variant='surface' className='h-full w-full'>
            <div className='mb-2'>
                <Text as="div" size="4" weight="bold">
                    {title}
                </Text>
            </div>
            {
                centered ?
                    <div className="flex ml-auto mr-auto align-middle justify-center items-center content-center h-full">
                        {children}
                    </div>
                    :
                    <div className="max-h-screen">
                        <div className="overflow-y-scroll h-[50%]">
                            {children}
                        </div>
                    </div>
            }

        </Card>
    );
}