"use client";

import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { EmployeeSidebar } from "@/components/employee-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
    return (
      <div className="fixed inset-0 flex overflow-hidden w-full bg-background">
        <div className="w-64 border-r border-border/60 p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-10 w-36 rounded-lg mb-6" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg opacity-60" />
          ))}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-border/60 p-4 flex justify-between items-center">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <main className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl opacity-60" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl opacity-50" />
          </main>
        </div>
      </div>
    );
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
          <div className="w-full py-4 px-3 sm:px-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

