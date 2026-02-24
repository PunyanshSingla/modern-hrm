"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  icon: any;
}

interface SidebarCustomizerProps {
  items: SidebarItem[];
  storageKey: string;
  onUpdate: (hiddenItems: string[]) => void;
  isCollapsed?: boolean;
}

export function SidebarCustomizer({ items, storageKey, onUpdate, isCollapsed }: SidebarCustomizerProps) {
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHiddenItems(parsed);
        onUpdate(parsed);
      } catch (e) {
        console.error("Failed to parse sidebar settings", e);
      }
    }
  }, [storageKey, onUpdate]);

  const toggleItem = (title: string) => {
    const newHidden = hiddenItems.includes(title)
      ? hiddenItems.filter(t => t !== title)
      : [...hiddenItems, title];
    
    setHiddenItems(newHidden);
    localStorage.setItem(storageKey, JSON.stringify(newHidden));
    onUpdate(newHidden);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full gap-3 h-12 rounded-xl font-bold transition-all duration-300 group", 
            isCollapsed ? "justify-center px-0" : "justify-start px-4"
          )}
          title={isCollapsed ? "Customize Sidebar" : undefined}
        >
          <Settings2 className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:rotate-90" />
          {!isCollapsed && <span className="uppercase tracking-wide">Edit Menu</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Menu Settings</DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Choose which links you want in your menu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => {
            const isHidden = hiddenItems.includes(item.title);
            return (
              <div 
                key={item.title} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-300",
                  isHidden ? "bg-muted/30 border-transparent opacity-60" : "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    isHidden ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <Label htmlFor={`item-${item.title}`} className="font-bold cursor-pointer uppercase tracking-tight text-xs">
                    {item.title}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                   <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isHidden ? "text-muted-foreground" : "text-primary"
                    )}
                    onClick={() => toggleItem(item.title)}
                  >
                    {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Checkbox 
                    id={`item-${item.title}`} 
                    checked={!isHidden}
                    onCheckedChange={() => toggleItem(item.title)}
                    className="rounded-lg h-5 w-5 border-2"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">Saved automatically</p>
          <Button onClick={() => setOpen(false)} className="rounded-full px-8 font-bold">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
