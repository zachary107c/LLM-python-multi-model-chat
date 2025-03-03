import { Outlet } from "react-router-dom";
import { AppLayout } from "@/components/layouts/main-layout";

export const AppRoot = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};
