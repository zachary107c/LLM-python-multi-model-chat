import { Link } from "@/components/ui/link";

export const LoggedOutRoute = () => {
  return (
    <div className="mt-52 flex flex-col items-center font-semibold w-full h-full">
      <span className="text-3xl">Logged Out!</span>
      <div className="flex justify-center gap-1 pt-2 text-center text-sm">
        <p className="text-muted-foreground">Head back to the login screen.</p>
        <Link to="/login" replace>
          Login
        </Link>
      </div>
    </div>
  );
};
