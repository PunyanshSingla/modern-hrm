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
    <header className="flex h-14 md:h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6 shrink-0 sticky top-0 z-30 transition-all duration-200">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="h-9 w-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed || isMobile ? <Menu className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="h-4 bg-border/60" />
        
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-xs font-semibold text-muted-foreground/70 tracking-wider uppercase">
            {pathname.includes('employee') ? 'Employee' : 'Admin'}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <h1 className="text-sm md:text-base font-semibold text-foreground tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}

