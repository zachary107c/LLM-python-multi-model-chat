import { Card, Text, Skeleton } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export function WelcomeCardLoading() {
    return (
        <div className="p-1 w-full h-32 overflow-y-scroll no-scrollbar">
            <Card className="h-full w-full">
                <div className="flex flex-col h-full justify-between items-start w-full">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <div className="w-full flex justify-end">
                        <Button variant='ghost-no-hover' className="p-0 m-0">
                            <Skeleton />
                            <ArrowRightIcon />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}