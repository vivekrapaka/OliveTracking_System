
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Teammate {
  id: number;
  name: string;
  role: string;
}

interface TeammateSelectorProps {
  teammates: Teammate[];
  selectedTeammates: string[];
  onTeammateToggle: (teammateName: string) => void;
  label?: string;
}

export const TeammateSelector = ({ 
  teammates, 
  selectedTeammates, 
  onTeammateToggle, 
  label = "Assign Teammates" 
}: TeammateSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedTeammates.length === 0 
              ? "Select teammates..." 
              : `${selectedTeammates.length} teammate(s) selected`
            }
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search teammates..." />
            <CommandList>
              <CommandEmpty>No teammates found.</CommandEmpty>
              <CommandGroup>
                {teammates.map((teammate) => (
                  <CommandItem
                    key={teammate.id}
                    value={teammate.name}
                    onSelect={() => onTeammateToggle(teammate.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTeammates.includes(teammate.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{teammate.name}</span>
                      <span className="text-xs text-muted-foreground">{teammate.role}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedTeammates.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTeammates.map((name) => (
            <Badge key={name} variant="outline" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
