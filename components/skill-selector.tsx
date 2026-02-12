"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, Plus } from "lucide-react";
import { skills as predefinedSkills } from "@/lib/skills";

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillSelector({ selectedSkills = [], onChange }: SkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const filteredSkills = predefinedSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedSkills.includes(skill.name)
  );

  const handleSelect = (skillName: string) => {
    if (!selectedSkills.includes(skillName)) {
      onChange([...selectedSkills, skillName]);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const handleRemove = (skillName: string) => {
    onChange(selectedSkills.filter(s => s !== skillName));
  };

  const handleAddCustom = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      onChange([...selectedSkills, trimmed]);
      setCustomSkill("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
          {selectedSkills.map((skillName) => (
            <Badge key={skillName} variant="secondary" className="pl-2 pr-1 py-1.5 text-sm flex items-center gap-1.5">
              {skillName}
              <button
                type="button"
                onClick={() => handleRemove(skillName)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search skills..."
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
            {filteredSkills.length > 0 ? (
              <div className="p-1">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSelect(skill.name)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">{skill.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No skills found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Skill */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter custom skill"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
          />
          <Button type="button" size="sm" onClick={handleAddCustom}>
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => {
            setShowCustomInput(false);
            setCustomSkill("");
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
          Add Custom Skill
        </Button>
      )}
    </div>
  );
}
