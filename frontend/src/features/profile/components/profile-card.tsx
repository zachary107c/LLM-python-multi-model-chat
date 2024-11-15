import { useGetProfileQuery } from "../api/get-profile";
import { Card, Avatar } from "@radix-ui/themes";
import { UpdateProfileModal } from "./update-profile-modal";
import {
  PersonIcon,
  EnvelopeClosedIcon,
  RocketIcon,
  IdCardIcon,
} from "@radix-ui/react-icons";

export function ProfileCard() {
  const { data, isLoading, error } = useGetProfileQuery();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 space-y-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-16 w-16"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading profile</div>;
  }

  return (
    <Card className="w-full max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar
          src={data?.profile.image}
          fallback={data?.username.charAt(0) || "U"}
          className="w-16 h-16"
        />
        <div>
          <h1 className="text-2xl font-bold">{data?.username}</h1>
          <p>{data?.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <PersonIcon />
          <span>{`${data?.first_name} ${data?.last_name}`}</span>
        </div>
        <div className="flex items-center space-x-2">
          <EnvelopeClosedIcon />
          <span>{data?.email}</span>
        </div>
        <div className="flex flex-col items-left space-x-2">
          <div className="flex items-center text-center">
            <IdCardIcon className="mr-2" />
            Bio
          </div>
          {data?.profile.bio}
        </div>
        {data?.profile?.preferred_model?.name && (
          <div className="flex items-center space-x-2">
            <RocketIcon />
            <span>{data.profile.preferred_model.name}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <UpdateProfileModal />
      </div>
    </Card>
  );
}
