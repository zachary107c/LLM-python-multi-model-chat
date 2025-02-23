import { WelcomeCardLoading } from "./welcome-card-loading";
import { useUser } from "@/lib/auth";

export function WelcomeLoading() {
  const { data: user, isLoading: userLoading } = useUser();
  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-2 h-full items-start justify-center">
        <span className="text-seconday/50 font-bold title mask-text text-4xl">
          bruh.
        </span>
        {user && (
          <span className="text-2xl text-secondary-foreground">
            Welcome, {user.username}
          </span>
        )}
        <div className="flex justify-between items-center w-full">
          <WelcomeCardLoading />
          <WelcomeCardLoading />
          <WelcomeCardLoading />
        </div>
      </div>
    </div>
  );
}
