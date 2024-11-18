import { useState, useEffect } from "react";
import { Tooltip, Avatar } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { handleLogout } from "@/components/utils/handle-logout.ts";
import { useGetUserSettingsQuery } from "@/components/userSettings/api/get-user-settings";

import { Settings, MessageSquare, LogOut, BrainCircuit } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [index, setIndex] = useState(1);
  const { data: userSettings, isLoading: userSettingsLoading } =
    useGetUserSettingsQuery();

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        setIndex(1);
        break;
      case "/models":
        setIndex(2);
        break;
      case "/settings":
        setIndex(3);
        break;
      default:
        setIndex(0); // Or handle other undefined paths
        break;
    }
  }, [location.pathname]);

  return (
    <aside className="border-r border-[#7d7d7db3] bg-[#22222211]">
      <div className="flex flex-col m-2 items-center">
        <div className="mb-2">
          <Tooltip content="Settings" side="right">
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(3)}
                className={
                  index === 3 ? "bg-accent text-accent-foreground" : ""
                }
              >
                {userSettingsLoading || !userSettings?.profile?.image ? (
                  <Settings size={20} strokeWidth={1.5} />
                ) : (
                  <Avatar
                    src={userSettings.profile.image}
                    fallback="BS"
                    alt="Profile"
                    radius="medium"
                    size="2"
                  />
                )}
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Tooltip content="Home" side="right">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(1)}
                className={
                  index === 1 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <MessageSquare size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <Tooltip content="Models" side="right">
            <Link to="/models">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIndex(2)}
                className={
                  index === 2 ? "bg-accent text-accent-foreground" : ""
                }
              >
                <BrainCircuit size={20} strokeWidth={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </div>
        <div className="mb-2">
          <div>
            <Tooltip content="Logout" side="right">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={17} strokeWidth={1.5} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}
