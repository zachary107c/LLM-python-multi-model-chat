import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/navigation/navbar";

function App() {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            document.getElementById("body")?.classList.add("theme", theme);
        }
    }, []);
    return (
        <div className="main-page font-work-sans h-screen max-h-[100dvh] overflow-auto flex flex-row">
            <Navbar />
            <Outlet />
        </div>
    )
}

export default App