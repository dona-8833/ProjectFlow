import { Outlet } from "react-router-dom";
import { AppSidebar } from "../SideBar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/Sidebar";
import ProfilePicture from "./ProfilePicture";

const Applayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-15   items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
          <span className="text-sm font-medium">Project Flow</span>
          </div>
          <ProfilePicture/>
        </header>
        <main className="flex flex-1 flex-col gap-4 md:p-4 p-2">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Applayout;
