import { Skeleton } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";

export function ModelListLoading() {
    const randomNumber = Math.floor(Math.random() * (10 - 3 + 1)) + 3;

    return (
        <div>
            {[...Array(randomNumber)].map((_, index) => (
                <div key={index} className="w-full flex justify-between items-center mb-1">
                    <div className="w-full overflow-hidden">
                        <Button size='sm' variant={'ghost'} className="w-full justify-between items-center">
                            <Skeleton className="w-full h-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}