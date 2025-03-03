import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

type ToolsContextType = {
  toolId: string;
  setToolId: (id: string) => void;
};

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const ToolsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [toolId, setToolId] = useState<string>(searchParams.get("t") || "");

  useEffect(() => {
    const id = searchParams.get("t");
    if (id) {
      setToolId(id);
    }
  }, [searchParams]);

  const handleSetToolId = (id: string) => {
    if (id !== "") {
      setToolId(id);
      setSearchParams({ t: id });
      navigate(`/tools?t=${id}`);
    } else {
      setToolId("");
      setSearchParams({});
      navigate("/tools");
    }
  };

  return (
    <ToolsContext.Provider
      value={{ toolId, setToolId: handleSetToolId }}
    >
      {children}
    </ToolsContext.Provider>
  );
};

export const useToolId = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error(
      "useToolId must be used within a ToolsProvider"
    );
  }
  return context;
};
