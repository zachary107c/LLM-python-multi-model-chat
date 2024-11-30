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
  Switch,
} from "@radix-ui/themes";
import { withUserSettings } from "@/components/userSettings/user-settings-provider";
import { useUpdateUserSettingsMutation } from "@/components/userSettings/api/update-user-settings";
import { useGetUserSettingsQuery } from "@/components/userSettings/api/get-user-settings";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import {
  BaseModelEntity,
  Settings,
} from "@/types/api";
import { ModelSelect } from "@/features/model/components/model-select";
import "react-toastify/dist/ReactToastify.css";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/toast/toast-provider";


function SettingsPage() {
  const { addToast } = useToast();
  const { data: userSettings, isLoading: userSettingsLoading } =
    useGetUserSettingsQuery();
  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
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
    use_message_history: true,
    message_history_count: 5,
    use_tools: false
  };
  const [username, setUsername] = useState(userSettings?.username || "johndoe");
  const [email, setEmail] = useState(userSettings?.email || "john@example.com");
  const [bio, setBio] = useState(
    userSettings?.profile?.bio || "I love chatting!"
  );
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modelDetails, setModelDetails] = useState([]);
  const updateUserSettings = useUpdateUserSettingsMutation();


  useEffect(() => {
    if (modelDetails.length > 0) {
      const timer = setTimeout(() => {
        setModelDetails([]); // Clear models after 5 seconds
      }, 10000);

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [modelDetails]);

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

  function handleUseToolsToggled() {
    setSettings((prev) => ({
      ...prev,
      use_tools: !prev.use_tools,
    }));
  }

  function handleUseMessageHistoryToggled() {
    setSettings((prev) => ({
      ...prev,
      use_message_history: !prev.use_message_history,
    }));
  }

  function handleSetMessageHistoryCount(count: string) {
    const parsedCount = Number(count);
    if (!isNaN(parsedCount)) {
      setSettings((prev) => ({
        ...prev,
        message_history_count: parsedCount,
      }));
    }
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
        addToast("Image must be less than 5MB", "error");
        return;
      }

      // Check file type - allow images and gifs
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        addToast("File must be an image (JPG, PNG) or GIF", "error");
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
    console.log(settings);
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
    formData.append("settings.use_message_history", settings.use_message_history.toString());
    formData.append("settings.message_history_count", settings.message_history_count.toString());
    formData.append("settings.use_tools", settings.use_tools.toString());

    updateUserSettings.mutate(
      {
        data: formData,
      },
      {
        onSuccess: () => {
          addToast("Settings updated successfully!", "success");
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

          addToast(errorMessage, "error");
        },
      }
    );
  };

  async function handleUpdateModels() {
    try {
      const response = await api.post("/models/populate/", undefined, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
      setModelDetails(response.data);
    } catch (error) {
      console.error("Error updating models:", error);
      addToast("Failed to update models", "error");
    }
  }

  return (
    <div className=" overflow-y-scroll no-scrollbar">
      <Box
        p="6"
        style={{ maxWidth: "64rem" }}
        className="overflow-y-scroll no-scrollbar"
      >
        <Heading size="8" mb="6">
          Settings
        </Heading>
        <Tabs.Root defaultValue="settings">
          <Tabs.List>
            <Tabs.Trigger value="settings">App Settings</Tabs.Trigger>
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="admin">Admin</Tabs.Trigger>
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
                    <Flex justify="between" align="center">
                      <div className="flex flex-col w-full">
                        <Text as="label" size="2" weight="bold">
                          Message History
                        </Text>
                        <div className="flex justify-between items-center w-full">
                          <Text size="1" color="gray">
                            Utilize message history for context
                          </Text>
                          <Switch
                            checked={settings.use_message_history}
                            onCheckedChange={handleUseMessageHistoryToggled}
                          />
                        </div>
                        {settings.use_message_history && (
                          <Flex align="center" mt="2">
                            <Text size="1" mr="2">
                              History Count:
                            </Text>
                            <TextField.Root
                              type="number"
                              value={settings.message_history_count}
                              onChange={(e) => handleSetMessageHistoryCount(e.target.value)}
                              min="1"
                              max="10"
                            />
                          </Flex>
                        )}
                      </div>
                    </Flex>
                    <Flex justify="between" align="center">
                      <div className="flex flex-col w-full">
                        <Text as="label" size="2" weight="bold">
                          Use Tools
                        </Text>
                        <div className="flex justify-between items-center w-full">
                          <Text size="1" color="gray">
                            Enable the LLM to utilize your tools
                          </Text>
                          <Switch
                            checked={settings.use_tools}
                            onCheckedChange={handleUseToolsToggled}
                          />
                        </div>
                      </div>
                    </Flex>
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
              <Tabs.Content value="admin">
                <Card>
                  <Heading size="6" mb="2">
                    Admin Stuff
                  </Heading>
                  <Text color="gray" mb="4">
                    Admin related features.
                  </Text>
                  <Flex align="center" gap="4" mb="4">
                    <Button
                      onClick={async () => {
                        try {
                          await handleUpdateModels();
                        } catch (error) {
                          console.error("Error syncing models:", error);
                        }
                      }}
                    >
                      Sync Models
                    </Button>
                    <Flex
                      direction="column"
                      overflowY="scroll"
                      className="no-scrollbar h-64"
                    >
                      {modelDetails.map(
                        (
                          group: { message: string; success: boolean },
                          index
                        ) => (
                          <Card key={index} mb="2" size="5">
                            <Text
                              color={group.success ? "green" : "red"}
                              className="h-full flex align-middle justify-start items-center text-left"
                            >
                              {group.message}
                            </Text>
                          </Card>
                        )
                      )}
                    </Flex>
                  </Flex>
                </Card>
              </Tabs.Content>
            </Flex>
          </Box>
        </Tabs.Root>
        <Box mt="4">
          <Button onClick={handleSave} variant="surface">
            Save Changes
          </Button>
        </Box>
      </Box>
    </div>
  );
}

export default withUserSettings(SettingsPage);
