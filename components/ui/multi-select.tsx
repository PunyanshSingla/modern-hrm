"use client";

import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  maxCount?: number;
  className?: string;
}

export function MultiSelect({
  options,
  onValueChange,
  defaultValue = [],
  placeholder = "Select options...",
  maxCount = 3,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(defaultValue);

  const handleUnselect = (item: string) => {
    const newSelected = selected.filter((i) => i !== item);
    setSelected(newSelected);
    onValueChange(newSelected);
  };

  const handleSelect = (item: string) => {
    const newSelected = selected.includes(item)
      ? selected.filter((i) => i !== item)
      : [...selected, item];
    setSelected(newSelected);
    onValueChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-12 py-2 px-3 rounded-2xl border-2 transition-all hover:bg-background group",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selected.length > 0 ? (
              <>
                {selected.slice(0, maxCount).map((val) => {
                  const option = options.find((o) => o.value === val);
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase bg-primary/10 text-primary border-none flex items-center gap-1"
                    >
                      {option?.label}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-rose-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnselect(val);
                        }}
                      />
                    </Badge>
                  );
                })}
                {selected.length > maxCount && (
                  <Badge variant="secondary" className="rounded-lg px-2 py-0.5 font-black text-[10px] bg-muted text-muted-foreground border-none">
                    +{selected.length - maxCount} MORE
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground font-medium italic text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl border-2 shadow-2xl overflow-hidden mt-2" align="start">
        <Command className="bg-popover">
          <CommandInput placeholder="Search..." className="h-12 border-none focus:ring-0 font-bold" />
          <CommandList className="max-h-[300px] custom-scrollbar">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-primary/5 transition-colors rounded-xl mx-1 my-0.5"
                >
                  <span className="font-bold text-sm">{option.label}</span>
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                    selected.includes(option.value) ? "bg-primary border-primary" : "border-muted-foreground/20"
                  )}>
                    {selected.includes(option.value) && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
