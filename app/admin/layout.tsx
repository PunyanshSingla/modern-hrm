"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen, isMobile } = useSidebar();

  return (
    <div className="fixed inset-0 flex overflow-hidden w-full bg-background selection:bg-primary/10 selection:text-primary">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && (
        <div 
          className={cn(
            "fixed inset-0 z-[40] bg-background/60 backdrop-blur-md lg:hidden transition-all duration-500",
            isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-[50] lg:relative transition-all duration-500 ease-in-out transform",
        isMobile && !isSidebarOpen ? "-translate-x-full shadow-none" : "translate-x-0"
      )}>
        <AdminSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-muted/5 scroll-smooth">
          <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

