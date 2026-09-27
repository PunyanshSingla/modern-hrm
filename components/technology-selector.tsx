"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { technologies, searchTechnologies, type Technology } from "@/lib/technologies";
import { TechIcon } from "@/components/ui/tech-icon";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { X, Plus, Search, Check, ChevronDown, Sparkles, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnologySelectorProps {
  selectedTechnologies: string[];
  onChange: (technologies: string[]) => void;
  className?: string;
}

const CATEGORIES = [
  "All",
  "Frontend",
  "Backend",
  "Language",
  "Database",
  "DevOps",
  "Tool",
  "Mobile",
  "Testing",
  "API",
];

export function TechnologySelector({
  selectedTechnologies = [],
  onChange,
  className,
}: TechnologySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customTech, setCustomTech] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize selected technologies
  const selectedTechArray = useMemo(
    () => (Array.isArray(selectedTechnologies) ? selectedTechnologies : []),
    [selectedTechnologies]
  );

  // Filtered technologies based on search query and category tab
  const filteredTechnologies = useMemo(() => {
    let result = searchQuery ? searchTechnologies(searchQuery) : technologies;
    if (selectedCategory !== "All") {
      result = result.filter(
        (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return result;
  }, [searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const baseList = searchQuery ? searchTechnologies(searchQuery) : technologies;
    const counts: Record<string, number> = { All: baseList.length };
    baseList.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [searchQuery]);

  const handleSelect = (tech: Technology) => {
    if (!selectedTechArray.includes(tech.name)) {
      onChange([...selectedTechArray, tech.name]);
    } else {
      onChange(selectedTechArray.filter((t) => t !== tech.name));
    }
  };

  const handleRemove = (techName: string) => {
    onChange(selectedTechArray.filter((t) => t !== techName));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleAddCustom = (nameToAdd?: string) => {
    const name = (nameToAdd || customTech).trim();
    if (name && !selectedTechArray.includes(name)) {
      onChange([...selectedTechArray, name]);
      setCustomTech("");
      setShowCustomInput(false);
      if (nameToAdd) setSearchQuery("");
    }
  };

  const getTechData = (techName: string) => {
    return (
      technologies.find((t) => t.name.toLowerCase() === techName.toLowerCase()) || {
        id: techName.toLowerCase().replace(/\s+/g, "-"),
        name: techName,
        category: "Custom",
      }
    );
  };

  return (
    <div className={cn("space-y-3.5", className)} ref={dropdownRef}>
      {/* Selected Technologies Container */}
      {selectedTechArray.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-3.5 shadow-sm space-y-2.5 transition-all">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Selected Proficiencies ({selectedTechArray.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTechArray.map((techName) => {
              const techData = getTechData(techName);
              return (
                <Badge
                  key={techName}
                  variant="secondary"
                  className="pl-2 pr-1.5 py-1 rounded-xl text-xs font-medium bg-background/80 hover:bg-background border border-border/60 text-foreground shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02] group"
                >
                  <TechIcon tech={techData} size={16} />
                  <span>{techName}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(techName);
                    }}
                    className="p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors"
                    title={`Remove ${techName}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Popover Component Wrapper */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          {/* Search Input Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search & select technologies (e.g. React, Node.js, Python)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="pl-10 pr-16 h-11 rounded-xl border border-border/80 bg-background shadow-xs hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm"
            />
            <div className="absolute right-3 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>
            </div>
          </div>
        </PopoverAnchor>

        {/* Dropdown Menu via Radix Portal */}
        <PopoverContent
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-[--radix-popover-anchor-width] min-w-[300px] p-0 border border-border/80 rounded-2xl shadow-2xl overflow-hidden bg-popover/95 backdrop-blur-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Category Filter Scrollable Bar */}
          <div className="flex items-center gap-1 p-2 border-b border-border/40 overflow-x-auto no-scrollbar bg-muted/20">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              if (cat !== "All" && count === 0) return null;
              const isCatSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer",
                    isCatSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-medium",
                        isCatSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/15 text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tech List */}
          <div className="p-2 max-h-72 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
            {filteredTechnologies.length > 0 ? (
              filteredTechnologies.map((tech) => {
                const isSelected = selectedTechArray.includes(tech.name);
                return (
                  <div
                    key={tech.id}
                    onClick={() => handleSelect(tech)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer group select-none",
                      isSelected
                        ? "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15"
                        : "hover:bg-accent/70 hover:border-accent border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-background border border-border/50 group-hover:border-primary/30 transition-all shrink-0 shadow-2xs">
                        <TechIcon tech={tech} size={22} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <span>{tech.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block px-1.5 py-0.2 rounded-md bg-muted font-medium text-[10px]">
                            {tech.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          Selected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No technologies found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    No technology matched &quot;{searchQuery}&quot;
                  </p>
                </div>
                {searchQuery && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddCustom(searchQuery)}
                    className="rounded-xl gap-1.5 font-medium text-xs shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add &quot;{searchQuery}&quot; as custom technology
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Footer option to add custom tech */}
          <div className="p-2 border-t border-border/40 bg-muted/10 flex items-center justify-between text-xs">
            <span className="text-muted-foreground px-2">Can&apos;t find what you need?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(true);
                setIsOpen(false);
              }}
              className="h-7 px-2.5 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Custom Tech
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Inline Custom Tech Input */}
      {showCustomInput && (
        <div className="p-3 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm space-y-2 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Add Custom Technology or Tool
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="e.g. Docker Compose, Redux Toolkit..."
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              className="h-9 rounded-xl text-xs border-border/60 bg-background"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddCustom()}
              disabled={!customTech.trim()}
              className="h-9 rounded-xl text-xs px-3 font-semibold"
            >
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCustomInput(false);
                setCustomTech("");
              }}
              className="h-9 rounded-xl text-xs px-2.5 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


