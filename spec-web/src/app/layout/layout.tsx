import { Outlet } from "@tanstack/react-router"
import { BottomPanel } from "../../features/bottom-navigation/ui/bottom-panel/bottom-panel"


export const Layout = () => {
    return (
        <>
            <div className="min-h-[100vh] bg-[#F5F5F5] px-4">
                <main className="pt-10 pb-28 flex-1"><Outlet /></main>
            </div>
            <BottomPanel />
        </>
    )
}
