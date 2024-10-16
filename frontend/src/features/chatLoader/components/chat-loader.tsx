import { BarLoader } from "react-spinners";

export function ChatLoader() {
  return (
    <div>
      <div className="mb-2 flex">
        <div className="mr-2">
          <BarLoader
            color="#484848"
            width="200px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#484848"
          width="100px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
      <div className="mb-2 flex">
        <div className="mr-2">
          <BarLoader
            color="#484848"
            width="150px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#484848"
          width="150px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
      <div className="flex">
        <div className="mr-2">
          <BarLoader
            color="#484848"
            width="25px"
            speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
          />
        </div>
        <BarLoader
          color="#484848"
          width="275px"
          speedMultiplier={0.25 + Math.random() * (1.5 - 0.25)}
        />
      </div>
    </div>
  );
}
