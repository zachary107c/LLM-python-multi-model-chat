import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageUploadButton } from "@/features/imageUpload/components/image-upload-button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  imageName: string | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  handleOuterClear: () => void;
  previewUrl: string | null;
}

export function FileUpload({
  imageName,
  onFileChange,
  onClear,
  handleOuterClear,
  previewUrl,
}: FileUploadProps) {
  const { toast } = useToast();


  const handleFileValidation = (file: File | null) => {
    if (!file) {
      onFileChange(null);
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast({title: "Image Too Large", description: "Image must be less than 30MB", variant: "destructive"});
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      toast({title: "Invalid image file type", description: "File must be an image (JPG, PNG, WebP, HEIC) or GIF", variant: "destructive"});
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileChange(file);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      {imageName ? null : (
        <div>
          <ImageUploadButton
            fileName={imageName}
            onFileChange={handleFileValidation}
            onClear={onClear}
            previewUrl={previewUrl}
          />
        </div>
      )}
      {imageName && (
        <div>
          <Badge variant="outline" className="px-1 py-0">
            <div className="w-full flex justify-between items-center gap-1">
              <span className="text-xs">
                {imageName}
              </span>
              <Button
                size="sm"
                variant="ghostNoHover"
                onClick={handleOuterClear}
                className="p-0 w-2"
              >
                <X size={6}className="p-0 m-0"/>
              </Button>
            </div>
          </Badge>
        </div>
      )}
    </>
  );
}
