import { Button } from "@/components/ui/button";
import { ImageUploadButton } from "@/features/imageUpload/components/image-upload-button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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
      toast({
        title: "Image Too Large",
        description: "Image must be less than 30MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid image file type",
        description: "File must be an image (JPG, PNG, WebP, HEIC) or GIF",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileChange(file);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileValidation(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="relative h-8">
      {" "}
      {imageName ? null : (
        <div className="absolute top-0 left-0 flex items-center justify-center">
          <ImageUploadButton
            fileName={imageName}
            onFileChange={handleFileValidation}
            onClear={onClear}
            previewUrl={previewUrl}
          />
        </div>
      )}
      {imageName && previewUrl && (
        <div className="absolute top-0 left-0 group">
          <div className="w-8 h-8 rounded overflow-hidden">
            <img
              src={previewUrl}
              alt={imageName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="ghostNoHover"
                onClick={handleOuterClear}
                className="p-0 flex items-center justify-center"
              >
                <X size={12} className="text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
