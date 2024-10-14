import { WelcomeCardLoading } from "./welcome-card-loading";

export function WelcomeLoading() {
    return (
        <div className="w-full h-full">
            <div className="h-full flex justify-between items-center">
                <WelcomeCardLoading />
                <WelcomeCardLoading />
                <WelcomeCardLoading />
            </div>
        </div>
    );
}