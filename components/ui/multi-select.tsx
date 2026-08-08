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
import { Checkbox } from "@/components/ui/checkbox";

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
            "w-full justify-between h-auto min-h-9 py-1.5 px-3 rounded-lg border border-muted-foreground/60 transition-all hover:bg-background group shadow-none text-xs",
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
                      className="rounded-md px-1.5 py-0.5 font-medium text-xs bg-primary/10 text-primary border-none flex items-center gap-1"
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
                  <Badge variant="secondary" className="rounded-md px-1.5 py-0.5 font-semibold text-xs bg-muted text-muted-foreground border-none">
                    +{selected.length - maxCount} more
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground font-normal text-xs">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border shadow-md overflow-hidden mt-1" align="start">
        <Command className="bg-popover">
          <CommandInput placeholder="Search..." className="h-9 text-xs font-normal" />
          <CommandList className="max-h-[220px] custom-scrollbar p-1">
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2.5 py-1.5 px-2 cursor-pointer rounded-lg text-xs"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="border-muted-foreground/60"
                    />
                    <span className="font-medium text-xs text-foreground">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
