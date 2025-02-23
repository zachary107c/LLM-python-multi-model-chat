import ReactDOM from "react-dom/client";
import * as React from "react";
import "@/styles/output.css";
import { App } from "@/app";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
