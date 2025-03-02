import { memo } from "react";
import { HashLoader } from "react-spinners";

export const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <HashLoader color="#484848" size={200} />
    </div>
  );
});