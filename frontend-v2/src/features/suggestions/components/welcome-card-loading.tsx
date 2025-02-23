
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeCardLoading() {
  return (
    <div className="p-1 w-full h-28 overflow-y-scroll no-scrollbar">
      <Card className="h-full w-full p-2 bg-secondary">
        <div className="flex flex-col h-full justify-between items-start w-full">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <div className="w-full flex justify-end">
            <Button variant="ghost" className="p-0 m-0">
              <Skeleton />
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
