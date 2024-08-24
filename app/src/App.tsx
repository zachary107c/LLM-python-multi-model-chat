import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

function App() {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme) {
            document.getElementById("body")?.classList.add("theme", theme);
        }
    }, []);
    return (
        <div className="grid w-full pl-[55px]">
            <Outlet />
        </div>
    )
}

export default App