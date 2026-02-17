"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For mobile drawer

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Optional: Persist state to localStorage for desktop only
    if (window.innerWidth >= 1024) {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved) {
        setIsCollapsed(JSON.parse(saved));
      }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed((prev) => {
        const newState = !prev;
        localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
        return newState;
      });
    }
  };

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      toggleSidebar, 
      isMobile, 
      isSidebarOpen, 
      setSidebarOpen 
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
