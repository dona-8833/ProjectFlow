import { Outlet } from "react-router-dom";
import { AppSidebar } from "../SideBar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/Sidebar";

const Applayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12  items-center gap-2 border-b px-4">
          <SidebarTrigger className="md:hidden" />
          <span className="text-sm font-medium">Project Flow</span>
        </header>
        <main className="flex flex-1 flex-col gap-4 md:p-4 p-2">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Applayout;
