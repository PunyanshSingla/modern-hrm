"use client";

import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { cn } from "@/lib/utils";

function EmployeeLayoutContent({ children }: { children: React.ReactNode }) {
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
        <EmployeeSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader /> 
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EmployeeLayoutContent>{children}</EmployeeLayoutContent>
    </SidebarProvider>
  );
}
