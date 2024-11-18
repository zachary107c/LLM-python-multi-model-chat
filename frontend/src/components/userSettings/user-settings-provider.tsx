import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useGetUserSettingsQuery } from "./api/get-user-settings";
import { UserSettings } from "@/types/api";

interface UserSettingsContextType {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const defaultSettings: UserSettings = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  profile: {
    image: "",
    bio: "",
  },
  settings: {
    preferred_model: {
      id: 0,
      name: "",
      model: "",
      liked: false,
      provider: "",
      color: "gray",
    },
    stream_responses: true,
    theme: "light",
  },
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(
  undefined
);

const applyTheme = (theme: string) => {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
};

interface UserSettingsProviderProps {
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<UserSettingsProviderProps> = ({
  children,
}) => {
  const {
    data: fetchedSettings,
    isLoading,
    isError,
  } = useGetUserSettingsQuery();
  const [userSettingsData, setUserSettingsData] = useState<UserSettings>(() => {
    const storedSettings = localStorage.getItem("userSettings");
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  });

  useEffect(() => {
    if (fetchedSettings) {
      setUserSettingsData(fetchedSettings);
      const theme = fetchedSettings.settings.theme || "light";
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    }
  }, [fetchedSettings]);

  return (
    <UserSettingsContext.Provider
      value={{
        userSettings: userSettingsData,
        setUserSettings: setUserSettingsData,
      }}
    >
      {children}
      {isError && <div>Error loading user settings</div>}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider"
    );
  }
  return context;
};

export function withUserSettings<P extends { userSettings: UserSettings }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof { userSettings: UserSettings }>> {
  return function WrappedComponent(
    props: Omit<P, keyof { userSettings: UserSettings }>
  ) {
    const context = useUserSettings();
    return <Component {...(props as P)} userSettings={context} />;
  };
}
