import { useGetProfileQuery } from "../api/get-profile";
import { Card, Avatar } from "@radix-ui/themes";
import { UpdateProfileModal } from "./update-profile-modal";



export function ProfileCard() {
    const { data, isLoading, error } = useGetProfileQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    };

    return (
        <Card>
            <Avatar src={data?.profile.image} fallback={data?.username.charAt(0) || 'U'}/>
            <h1>{data?.username}</h1>
            <h1>{data?.email}</h1>
            <h1>{data?.firstName}</h1>
            <h1>{data?.lastName}</h1>
            <h1>{data?.username}</h1>
            <h1>{data?.profile.bio}</h1>
            <h1>{data?.profile?.preferredModel?.name}</h1>
            <div className="w-full flex justify-end items-center">
                <UpdateProfileModal />
            </div>
        </Card>
    );


}