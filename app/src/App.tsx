import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navigation from "./components/ui/navigation/navigation";

function App() {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            document.getElementById("body")?.classList.add("theme", theme);
        }
    }, []);
    return (
        <div className="h-screen max-h-[100dvh] overflow-auto flex flex-row">
            <Navigation />
            <Outlet />
        </div>
    )
}

export default App