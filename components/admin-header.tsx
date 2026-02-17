"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeft, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const pathname = usePathname();
  const { toggleSidebar, isCollapsed, isMobile } = useSidebar();
  
  // Simple logic to determine page title from pathname
  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment === "admin") return "Dashboard";
    if (segments.includes("dashboard")) return "Dashboard";
    if (segments.includes("employees") && segments.length === 2) return "Employees";
    if (segments.includes("departments") && segments.length === 2) return "Departments";
    if (segments.length > 2) return "Details"; // Generic fallback for IDs

    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };
  
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 border-b bg-background/60 backdrop-blur-xl px-4 md:px-8 shrink-0 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-6">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-xl hover:bg-muted/80 h-9 w-9 md:h-10 md:w-10 border border-muted-foreground/10 transition-transform active:scale-95">
          {isCollapsed || isMobile ? <Menu className="h-4 w-4 md:h-5 md:w-5 text-primary" /> : <PanelLeft className="h-5 w-5 text-primary" />}
        </Button>
        
        {isMobile && (
          <div className="flex items-center gap-2 lg:hidden">
             <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}

        <div className="flex flex-col overflow-hidden max-w-[150px] sm:max-w-none">
          <h1 className="text-xs md:text-sm font-black uppercase tracking-widest text-primary/70 truncate">{title}</h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-medium flex items-center gap-1.5 capitalize whitespace-nowrap">
            {pathname.includes('admin') ? 'Admin' : 'Employee'} <span className="h-1 w-1 rounded-full bg-muted-foreground/30" /> Overview
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
        <ThemeToggle />
      </div>
    </header>
  );
}
