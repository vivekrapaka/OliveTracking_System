
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

interface TeammateMultiSelectorProps {
  teammates: Teammate[];
  selectedTeammateIds: number[];
  onTeammateToggle: (teammateId: number) => void;
  label?: string;
}

export const TeammateMultiSelector = ({
  teammates,
  selectedTeammateIds,
  onTeammateToggle,
  label = "Assign Teammates"
}: TeammateMultiSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedTeammates = teammates.filter(teammate => 
    selectedTeammateIds.includes(teammate.id)
  );

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
            {selectedTeammateIds.length === 0
              ? "Select teammates..."
              : `${selectedTeammateIds.length} teammate(s) selected`
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
                    onSelect={() => onTeammateToggle(teammate.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTeammateIds.includes(teammate.id) ? "opacity-100" : "opacity-0"
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
          {selectedTeammates.map((teammate) => (
            <Badge key={teammate.id} variant="outline" className="text-xs">
              {teammate.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
