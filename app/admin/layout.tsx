"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen, isMobile } = useSidebar();

  return (
    <div className="fixed inset-0 flex overflow-hidden w-full bg-background">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[40] bg-background/80 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-[50] lg:relative transition-transform duration-300 transform",
        isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
