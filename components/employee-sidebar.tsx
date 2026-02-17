"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Laptop, 
  Banknote, 
  CalendarHeart, 
  FolderKanban,
  X,
  ChevronRight
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/sidebar-provider";

import { useState, useCallback } from "react";
import { SidebarCustomizer } from "@/components/sidebar-customizer";

export function EmployeeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobile, setSidebarOpen } = useSidebar();
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);

  const handleUpdate = useCallback((hidden: string[]) => {
    setHiddenItems(hidden);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Leaves",
      href: "/employee/leaves",
      icon: Calendar,
    },
    {
      title: "My Pay",
      href: "/employee/pay",
      icon: Banknote,
    },
    {
      title: "Holidays",
      href: "/employee/holidays",
      icon: CalendarHeart,
    },
    {
      title: "My Attendance",
      href: "/employee/attendance",
      icon: Clock,
    },
    {
      title: "My Projects",
      href: "/employee/projects",
      icon: FolderKanban,
    },
    {
      title: "My Profile",
      href: "/employee/profile",
      icon: User,
    },
    {
      title: "IT Requests",
      href: "/employee/it-requests",
      icon: Laptop,
    },
    {
      title: "Resignations",
      href: "/employee/resignations",
      icon: LogOut,
    },
    {
      title: "My Tasks",
      href: "/employee/tasks",
      icon: LayoutDashboard,
    },
  ];

  const filteredItems = sidebarItems.filter(item => !hiddenItems.includes(item.title));

  const handleLogout = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                router.push("/login");
            }
        }
    });
  };

  return (
    <div 
        className={cn(
            "flex flex-col h-full shrink-0 border-r bg-card transition-all duration-300 ease-in-out",
            isCollapsed && !isMobile ? "w-20" : "w-72",
            isMobile ? "w-72 shadow-2xl" : ""
        )}
    >
      <div className={cn(
        "flex items-center h-20 border-b px-6 relative shrink-0", 
        isCollapsed && !isMobile ? "justify-center px-0" : "justify-between"
      )}>
        <Link href="/employee/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 shrink-0">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <h2 className="text-lg font-black tracking-tight leading-none text-foreground uppercase">My Portal</h2>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em]">HRM SYSTEM</span>
              </div>
            )}
        </Link>
        
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(false)}
            className="rounded-full hover:bg-muted h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={handleLinkClick}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && !isMobile ? "justify-center px-0 h-12 w-12 mx-auto" : ""
                )}
                title={isCollapsed && !isMobile ? item.title : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-primary/70 group-hover:text-primary"
                )} />
                {(!isCollapsed || isMobile) && (
                  <span className="truncate flex-1 uppercase tracking-wide text-[13px]">{item.title}</span>
                )}
                {isActive && !isCollapsed && (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
                
                {isCollapsed && !isMobile && isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-muted/20 space-y-2 shrink-0">
        <SidebarCustomizer 
          items={sidebarItems} 
          storageKey="employee-sidebar-hidden" 
          onUpdate={handleUpdate}
          isCollapsed={isCollapsed && !isMobile}
        />
        <Button 
          variant="ghost" 
          className={cn(
            "w-full gap-3 h-12 rounded-xl font-bold transition-all duration-200 group", 
            isCollapsed && !isMobile ? "justify-center px-0 w-12 mx-auto" : "justify-start px-4"
          )} 
          onClick={handleLogout} 
          title={isCollapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-rose-500 transition-transform group-hover:translate-x-1" />
          {(!isCollapsed || isMobile) && <span className="text-rose-500 uppercase tracking-wide text-[13px]">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

