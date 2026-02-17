"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeft, Building2, ChevronRight } from "lucide-react";
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

    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };
  
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 border-b bg-background/60 backdrop-blur-xl px-4 md:px-8 shrink-0 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="rounded-xl hover:bg-muted/80 h-9 w-9 md:h-11 md:w-11 border border-muted-foreground/10 transition-all duration-200 active:scale-95 shadow-sm"
        >
          {isCollapsed || isMobile ? <Menu className="h-5 w-5 text-primary" /> : <PanelLeft className="h-5 w-5 text-primary" />}
        </Button>
        
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
            <span>{pathname.includes('admin') ? 'Admin' : 'Employee'}</span>
            <ChevronRight className="h-3 w-3 opacity-30" />
          </div>
          <h1 className="text-sm md:text-xl font-black text-foreground tracking-tight truncate leading-none">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block opacity-50" />
        <ThemeToggle />
      </div>
    </header>
  );
}

