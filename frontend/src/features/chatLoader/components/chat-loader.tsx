import { BarLoader } from "react-spinners";

export function ChatLoader() {
  return (
    <div className="">
      <div className="mb-2 flex">
        <div className="mr-2">
          <BarLoader
            color="#48484888"
            width="200px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#48484888"
          width="100px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
      <div className="mb-2 flex">
        <div className="mr-2">
          <BarLoader
            color="#48484888"
            width="150px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#48484888"
          width="150px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
      <div className="flex">
        <div className="mr-2">
          <BarLoader
            color="#48484888"
            width="25px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#48484888"
          width="275px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
    </div>
  );
}
