import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useUpdateUserSettingsMutation } from "@/lib/auth";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { ModelSelect } from "@/features/model/components/model-select";
import { ImageIcon } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3).max(50),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  use_message_history: z.boolean(),
  stream_responses: z.boolean(),
  message_history_count: z.number().min(0).max(15),
  preferred_model: z.number(),
  profile_image: z.string().url().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ProfileRoute() {
  const { toast } = useToast();
  const { data: user } = useUser();
  const updateUserSettings = useUpdateUserSettingsMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profile.image || null
  );
  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      use_message_history: user?.settings.use_message_history,
      stream_responses: user?.settings.stream_responses,
      message_history_count: user?.settings.message_history_count,
      preferred_model: user?.settings.preferred_model?.id || models?.[0].id,
      profile_image: user?.profile.image,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formDataToSave = new FormData();
      for (const key in data) {
        if (key === "profile_image" && selectedFile) {
          formDataToSave.append(
            "profile.image",
            selectedFile,
            selectedFile.name
          );
        } else if (
          [
            "use_message_history",
            "message_history_count",
            "preferred_model",
            "stream_responses",
          ].includes(key)
        ) {
          formDataToSave.append(
            `settings.${key}`,
            data[key as keyof FormData] as any
          );
        } else {
          formDataToSave.append(key, data[key as keyof FormData] as any);
        }
      }
      await updateUserSettings.mutateAsync({ data: formDataToSave });
      toast({
        title: "Profile Update Success",
        description: "Successfully updated profile!",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Profile Update Error",
        description: `Failed to save profile updates: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Image Size Exceeded",
          description: "Image must be less than 25MB",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "File must be an image (JPG, PNG) or GIF",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const blobUrl = URL.createObjectURL(
          new Blob([reader.result as ArrayBuffer], { type: file.type })
        );
        setPreviewUrl(blobUrl);
      };
      reader.readAsArrayBuffer(file);
      setSelectedFile(file);
    }
  };

  const fields: Array<{ label: string; id: keyof FormData; type: string }> = [
    { label: "Username", id: "username", type: "text" },
    { label: "Email", id: "email", type: "email" },
    { label: "First Name", id: "first_name", type: "text" },
    { label: "Last Name", id: "last_name", type: "text" },
  ];

  return (
    <div className="w-full h-full flex justify-center items-start">
      <Card className="p-4 w-[60vw]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="relative w-24">
              <div
                onClick={handleAvatarClick}
                className="relative cursor-pointer group"
              >
                <Avatar className="w-24 h-24 rounded-lg">
                  <AvatarImage src={previewUrl || undefined} alt="Profile" />
                  <AvatarFallback>
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  accept="image/*"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ label, id, type }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} type={type} {...register(id)} />
                  {errors[id as keyof FormData] && (
                    <p className="text-sm text-red-500">
                      {errors[id as keyof FormData]?.message}
                    </p>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="preferred_model">Preferred Model</Label>
                <Controller
                  name="preferred_model"
                  control={control}
                  render={({ field }) => (
                    <ModelSelect
                      models={models}
                      onModelChange={(model) => field.onChange(model.id)}
                      selectedModel={
                        models?.find((m) => m.id === field.value) || null
                      }
                      modelsLoading={modelsLoading}
                      className="w-full"
                      variant="secondary"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Controller
                  name="stream_responses"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="stream_responses"
                    />
                  )}
                />
                <Label htmlFor="stream_responses">Stream Chat Responses</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Controller
                  name="use_message_history"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="use_message_history"
                    />
                  )}
                />
                <Label htmlFor="use_message_history">Use Message History</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message_history_count">
                Message History Count
              </Label>
              <Controller
                name="message_history_count"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={0}
                    max={15}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                )}
              />
              <p className="text-sm text-gray-500">
                Current value: {watch("message_history_count")}
              </p>
            </div>
          </div>

          <Button type="submit">Update Profile</Button>
        </form>
      </Card>
    </div>
  );
}
