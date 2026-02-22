"use client";

import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function EmployeeLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen, isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (pathname === '/employee/onboarding' || pathname === '/employee/profile') {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/employee/profile?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.profile.status !== 'verified') {
          router.push("/employee/onboarding");
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("Error checking onboarding status", e);
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [pathname, router]);

  if (loading && pathname !== '/employee/onboarding') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

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
        <EmployeeSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminHeader /> 
        <main className="flex-1 overflow-y-auto bg-muted/5 scroll-smooth">
          <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

