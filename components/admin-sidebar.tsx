"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, Building2, FolderKanban, Calendar as CalendarIcon, MapPin, Laptop, FileText, Banknote, Megaphone } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { useSidebar } from "@/components/sidebar-provider";
import { useState, useCallback } from "react";
import { SidebarCustomizer } from "@/components/sidebar-customizer";

export function AdminSidebar() {
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
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Employees",
      href: "/admin/employees",
      icon: Users,
    },
    {
      title: "Departments",
      href: "/admin/departments",
      icon: Building2,
    },
    {
      title: "Projects",
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      title: "Leaves",
      href: "/admin/leaves",
      icon: CalendarIcon, 
    },
    {
      title: "IT Requests",
      href: "/admin/it-requests",
      icon: Laptop,
    },
    {
      title: "Attendance",
      href: "/admin/attendance",
      icon: MapPin,
    },
    {
      title: "Payroll",
      href: "/admin/payroll",
      icon: Banknote,
    },
    {
      title: "Resignations",
      href: "/admin/resignations",
      icon: LogOut,
    },
    {
      title: "Tasks",
      href: "/admin/tasks",
      icon: LayoutDashboard,
    },
    {
      title: "Holidays",
      href: "/admin/holidays",
      icon: CalendarIcon, 
    },
    {
      title: "Announcements",
      href: "/admin/announcements",
      icon: Megaphone,
    },
    {
      title: "Resume Screening",
      href: "/admin/resume-screening",
      icon: FileText,
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
            "flex flex-col h-full shrink-0 border-r bg-muted/40 transition-all duration-300 ease-in-out",
            isCollapsed && !isMobile ? "w-16" : "w-64",
            isMobile ? "w-72 shadow-2xl bg-background" : ""
        )}
    >
      <div className={cn("flex items-center h-20 border-b px-6 bg-background/50 backdrop-blur-sm", isCollapsed && !isMobile ? "justify-center px-2" : "")}>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-3 animate-in fade-in duration-500">
            <div className="h-9 w-9 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-black whitespace-nowrap tracking-tight text-foreground uppercase italic">Modern HRM</h2>
          </div>
        )}
        {isCollapsed && !isMobile && (
          <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={handleLinkClick}>
            <span
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                isCollapsed && !isMobile ? "justify-center px-2" : ""
              )}
              title={isCollapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                pathname === item.href ? "text-primary-foreground" : "text-primary/70 group-hover:text-primary"
              )} />
              {(!isCollapsed || isMobile) && <span className="uppercase tracking-wide">{item.title}</span>}
            </span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t bg-muted/20 backdrop-blur-sm space-y-2">
        <SidebarCustomizer 
          items={sidebarItems} 
          storageKey="admin-sidebar-hidden" 
          onUpdate={handleUpdate}
          isCollapsed={isCollapsed && !isMobile}
        />
        <Button 
          variant="ghost" 
          className={cn(
            "w-full gap-3 h-12 rounded-xl font-bold transition-all duration-300 group", 
            isCollapsed && !isMobile ? "justify-center px-0" : "justify-start px-4"
          )} 
          onClick={handleLogout} 
          title={isCollapsed && !isMobile ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-rose-500 transition-transform group-hover:rotate-12" />
          {(!isCollapsed || isMobile) && <span className="text-rose-500 uppercase tracking-wide">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
