import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";

interface ImageExpandModalProps {
  imagePath: string;
}

export function ImageExpandModal({ imagePath }: ImageExpandModalProps) {
  return (
    <div className="relative pb-[current]">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-0 m-0 w-full h-full">
            <img
              src={imagePath}
              alt="Bold typography"
              className="block w-full h-[140px] object-cover bg-gray-100"
            />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col justify-start">
            <img
              src={imagePath}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}