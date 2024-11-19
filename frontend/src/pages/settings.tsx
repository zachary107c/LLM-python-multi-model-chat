import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Card,
  Tabs,
  Avatar,
  Button,
  TextField,
  TextArea,
  DropdownMenu,
  Switch,
  Callout,
  Progress,
  Skeleton,
} from "@radix-ui/themes";
import { withUserSettings } from "@/components/userSettings/user-settings-provider";
import { useUpdateUserSettingsMutation } from "@/components/userSettings/api/update-user-settings";
import { useGetUserSettingsQuery } from "@/components/userSettings/api/get-user-settings";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { BaseModelEntity, ModelDetail, Settings, UserSettingsUpdatePayload } from "@/types/api";
import { ToastContainer, toast } from "react-toastify";
import { ModelSelect } from "@/features/model/components/model-select";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { Button as LocalButton } from "@/components/ui/button";

function Toast({
  message,
  type,
  progress,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  progress: number;
  onClose: () => void;
}) {
  return (
    <Callout.Root
      color={type === "success" ? "green" : "red"}
      role="alert"
      style={{
        animation: "slideIn 0.3s ease-out, slideOut 0.3s ease-in forwards",
        animationDelay: "0s, 4.7s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <Callout.Icon className="mr-1">
          {type === "success" ? <CheckCircledIcon /> : <CrossCircledIcon />}
        </Callout.Icon>
        <Callout.Text size="1">{message}</Callout.Text>
        <LocalButton
          onClick={onClose}
          variant="ghost-no-hover"
          className="m-1 p-0"
        >
          <Cross2Icon />
        </LocalButton>
      </div>
      <Progress value={progress} />
    </Callout.Root>
  );
}

function SettingsPage() {
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      type: "success" | "error";
      progress: number;
      timeoutId?: ReturnType<typeof setTimeout>;
    }>
  >([]);
  const { data: userSettings, isLoading: userSettingsLoading } =
    useGetUserSettingsQuery();
  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
  const updateUserSettings = useUpdateUserSettingsMutation();

  const initialSettings: Settings = userSettings?.settings || {
    preferred_model: {
      id: 1,
      name: "",
      model: "gpt-3.5-turbo",
      liked: false,
      provider: "",
      color: "gray",
    },
    stream_responses: true,
    theme: "dark",
  };

  const [username, setUsername] = useState(userSettings?.username || "johndoe");
  const [email, setEmail] = useState(userSettings?.email || "john@example.com");
  const [bio, setBio] = useState(
    userSettings?.profile?.bio || "I love chatting!"
  );
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    const TOAST_DURATION = 5000; // 5 seconds
    const UPDATE_INTERVAL = 10; // Update progress every 10ms
    const id = Date.now();

    // Initialize toast with 100% progress
    const newToast = {
      id,
      message,
      type,
      progress: 100,
    };

    setToasts((prev) => [...prev, newToast]);

    // Create interval to update progress
    const intervalId = setInterval(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id
            ? {
                ...toast,
                progress: Math.max(
                  0,
                  toast.progress - (UPDATE_INTERVAL / TOAST_DURATION) * 100
                ),
              }
            : toast
        )
      );
    }, UPDATE_INTERVAL);

    // Remove toast after duration
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);

    // Store timeout ID to clear if needed
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, timeoutId } : toast))
    );
  };

  function handleModelChange(model: BaseModelEntity) {
    if (!userSettingsLoading) {
      const newPreferredModel = model ||
        (models && models[0]) || {
          id: -1,
          name: "llama3.1",
          model: "llama3.1",
          liked: false,
          provider: "",
          color: "gray",
        };

      setSettings((prev) => ({
        ...prev,
        preferred_model: newPreferredModel,
      }));
    }
  }

  useEffect(() => {
    if (userSettings) {
      setUsername(userSettings.username);
      setEmail(userSettings.email);
      setBio(userSettings.profile.bio);
      setSettings(userSettings.settings);
      setPreviewUrl(userSettings.profile.image);
    }
  }, [userSettings]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  function handleStreamingToggled() {
    setSettings((prev) => ({
      ...prev,
      stream_responses: !prev.stream_responses,
    }));
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image must be less than 5MB", "error");
        return;
      }

      // Check file type - allow images and gifs
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        showToast("File must be an image (JPG, PNG) or GIF", "error");
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

  const handleThemeChange = (checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      theme: checked ? "dark" : "light",
    }));
  };

  const handleSave = () => {
    const formData = new FormData();

    // Append basic fields
    formData.append("username", username);
    formData.append("email", email);
    formData.append("profile.bio", bio);

    // Handle image upload only if a new file was selected
    if (selectedFile) {
      const blob = new Blob([selectedFile], { type: selectedFile.type });
      formData.append("profile.image", blob, selectedFile.name);
    }

    // Append settings
    formData.append(
      "settings.preferred_model",
      settings.preferred_model.id.toString()
    );
    formData.append(
      "settings.stream_responses",
      settings.stream_responses.toString()
    );
    formData.append("settings.theme", settings.theme);

    updateUserSettings.mutate(
      {
        data: formData,
      },
      {
        onSuccess: () => {
          showToast("Settings updated successfully!", "success");
          setSelectedFile(null);
        },
        onError: (error: any) => {
          let errorMessage = "Failed to update settings.";
          if (error.response?.data) {
            const responseErrors = error.response.data;
            const formattedErrors = Object.entries(responseErrors)
              .map(([field, messages]) => {
                const fieldErrors = Array.isArray(messages)
                  ? messages.join(", ")
                  : messages;
                return `• ${field}: ${fieldErrors}`;
              })
              .join("\n");

            errorMessage = formattedErrors || errorMessage;
          }

          showToast(errorMessage, "error");
        },
      }
    );
  };

  return (
    <div className="overflow-y-scroll no-scrollbar">
      <Box p="6" style={{ maxWidth: "64rem" }}>
        <Box
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxWidth: "300px",
          }}
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              progress={toast.progress}
              onClose={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            />
          ))}
        </Box>
        <Heading size="8" mb="6">
          Settings
        </Heading>
        <Tabs.Root defaultValue="settings">
          <Tabs.List>
            <Tabs.Trigger value="settings">App Settings</Tabs.Trigger>
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
          </Tabs.List>
          <Box mt="4">
            <Flex
              direction="column"
              gap="6"
              maxWidth="600px"
              style={{ width: "100%" }}
            >
              <Tabs.Content value="settings" className="w-full">
                <Card className="w-full">
                  <Heading size="6" mb="">
                    App Settings
                  </Heading>
                  <div className="mb-4">
                    <Text color="gray">Customize your chat experience.</Text>
                  </div>
                  <Flex direction="column" gap="4">
                    <Flex direction="column" align="start">
                      <Text as="label" size="2" weight="bold">
                        Stream Chat Responses
                      </Text>
                      <div className="flex justify-between items-start gap-2">
                        <Text size="1" color="gray">
                          See responses as they're being generated
                        </Text>
                        <Switch
                          checked={settings.stream_responses}
                          onCheckedChange={handleStreamingToggled}
                        />
                      </div>
                    </Flex>
                    <Flex justify="between" align="center">
                      <div className="flex flex-col w-full">
                        <Text as="label" size="2" weight="bold">
                          Dark Mode
                        </Text>
                        <div className="flex justify-between items-center w-full">
                          <Text size="1" color="gray">
                            Toggle dark mode on or off
                          </Text>
                          <Switch
                            checked={settings.theme === "dark"}
                            onCheckedChange={handleThemeChange}
                          />
                        </div>
                      </div>
                    </Flex>
                    {/* Additional settings can be added here */}
                  </Flex>
                </Card>
              </Tabs.Content>
              <Tabs.Content value="profile">
                <Card>
                  <Heading size="6" mb="2">
                    Profile Information
                  </Heading>
                  <Text color="gray" mb="4">
                    Update your personal information here.
                  </Text>
                  <Flex align="center" gap="4" mb="4">
                    <Avatar
                      size="7"
                      src={previewUrl || undefined}
                      fallback="JD"
                      radius="medium"
                    />
                    <Button onClick={handleAvatarClick}>
                      Change Avatar
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                        accept="image/*"
                      />
                    </Button>
                  </Flex>
                  <Flex direction="column" gap="4">
                    <Box>
                      <Text as="label" size="2" mb="1" weight="bold">
                        Username
                      </Text>
                      <TextField.Root
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <Text as="label" size="2" mb="1" weight="bold">
                        Email
                      </Text>
                      <TextField.Root
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <Text as="label" size="2" mb="1" weight="bold">
                        Bio
                      </Text>
                      <TextArea
                        value={bio || ""}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </Box>
                    <Box>
                      <div className="flex flex-col ">
                        <Text as="label" size="2" mb="1" weight="bold">
                          Preferred Model
                        </Text>
                        <ModelSelect
                          selectedModel={
                            userSettingsLoading
                              ? null
                              : settings.preferred_model
                          }
                          models={models}
                          modelsLoading={modelsLoading}
                          onModelChange={handleModelChange}
                        />
                      </div>
                    </Box>
                  </Flex>
                </Card>
              </Tabs.Content>
            </Flex>
          </Box>
        </Tabs.Root>
        <Box mt="6">
          <Button onClick={handleSave}>Save Changes</Button>
        </Box>
      </Box>
    </div>
  );
}

export default withUserSettings(SettingsPage);
