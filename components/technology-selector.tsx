"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { technologies, searchTechnologies, type Technology } from "@/lib/technologies";
import { X, Plus, Search } from "lucide-react";
import Image from "next/image";

interface TechnologySelectorProps {
  selectedTechnologies: string[];
  onChange: (technologies: string[]) => void;
}

import { TechIcon } from "@/components/ui/tech-icon";

export function TechnologySelector({ selectedTechnologies = [], onChange }: TechnologySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [customTech, setCustomTech] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse selected technologies (could be objects or strings)
  const selectedTechArray = Array.isArray(selectedTechnologies) ? selectedTechnologies : [];
  
  const filteredTechnologies = searchQuery 
    ? searchTechnologies(searchQuery)
    : technologies;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (tech: Technology) => {
    if (!selectedTechArray.includes(tech.name)) {
      onChange([...selectedTechArray, tech.name]);
    }
    setSearchQuery("");
  };

  const handleRemove = (techName: string) => {
    onChange(selectedTechArray.filter(t => t !== techName));
  };

  const handleAddCustom = () => {
    if (customTech.trim() && !selectedTechArray.includes(customTech.trim())) {
      onChange([...selectedTechArray, customTech.trim()]);
      setCustomTech("");
      setShowCustomInput(false);
    }
  };

  const getTechData = (techName: string) => {
    return technologies.find(t => t.name === techName);
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Selected Technologies */}
      {selectedTechArray.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
          {selectedTechArray.map((techName) => {
            const techData = getTechData(techName);
            return (
              <Badge key={techName} variant="secondary" className="pl-2 pr-1 py-1.5 text-sm flex items-center gap-1.5">
                <TechIcon tech={techData} size={16} />
                {techName}
                <button
                  type="button"
                  onClick={() => handleRemove(techName)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search technologies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredTechnologies.length > 0 ? (
              <div className="p-1">
                {filteredTechnologies.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => handleSelect(tech)}
                    disabled={selectedTechArray.includes(tech.name)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TechIcon tech={tech} size={24} />
                    <div className="flex-1">
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">{tech.category}</div>
                    </div>
                    {selectedTechArray.includes(tech.name) && (
                      <span className="text-xs text-green-600">✓ Selected</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No technologies found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Technology */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter custom technology"
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
          />
          <Button type="button" size="sm" onClick={handleAddCustom}>
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => {
            setShowCustomInput(false);
            setCustomTech("");
          }}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCustomInput(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Technology
        </Button>
      )}
    </div>
  );
}
