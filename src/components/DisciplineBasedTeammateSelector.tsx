
import { Check, ChevronDown, Users, Code, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Teammate {
  id: number;
  name: string;
  role: string;
  functionalGroup: string;
}

interface DisciplineBasedTeammateSelectorProps {
  developers: Teammate[];
  testers: Teammate[];
  selectedDeveloperIds: number[];
  selectedTesterIds: number[];
  onDeveloperToggle: (teammateId: number) => void;
  onTesterToggle: (teammateId: number) => void;
}

export const DisciplineBasedTeammateSelector = ({
  developers,
  testers,
  selectedDeveloperIds,
  selectedTesterIds,
  onDeveloperToggle,
  onTesterToggle,
}: DisciplineBasedTeammateSelectorProps) => {
  const [developerOpen, setDeveloperOpen] = useState(false);
  const [testerOpen, setTesterOpen] = useState(false);

  const selectedDevelopers = developers.filter(dev => selectedDeveloperIds.includes(dev.id));
  const selectedTesters = testers.filter(tester => selectedTesterIds.includes(tester.id));

  return (
    <div className="space-y-6">
      {/* Developers Section */}
      <div className="space-y-3">
        <Label className="text-professional-navy font-medium flex items-center gap-2">
          <Code className="h-4 w-4 text-professional-blue" />
          Assign Developer(s)
        </Label>
        <Popover open={developerOpen} onOpenChange={setDeveloperOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={developerOpen}
              className="w-full justify-between professional-input"
            >
              {selectedDeveloperIds.length === 0
                ? "Select developers..."
                : `${selectedDeveloperIds.length} developer(s) selected`
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-md border-professional-slate/30">
            <Command>
              <CommandInput placeholder="Search developers..." />
              <CommandList>
                <CommandEmpty>No developers found.</CommandEmpty>
                <CommandGroup>
                  {developers.map((developer) => (
                    <CommandItem
                      key={developer.id}
                      value={developer.name}
                      onSelect={() => onDeveloperToggle(developer.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedDeveloperIds.includes(developer.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{developer.name}</span>
                        <span className="text-xs text-professional-slate-dark">{developer.role}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedDevelopers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDevelopers.map((developer) => (
              <Badge 
                key={developer.id} 
                className="bg-professional-blue/10 text-professional-blue-dark border-professional-blue/30 hover:bg-professional-blue/20 transition-colors"
              >
                <Code className="h-3 w-3 mr-1" />
                {developer.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Testers Section */}
      <div className="space-y-3">
        <Label className="text-professional-navy font-medium flex items-center gap-2">
          <TestTube className="h-4 w-4 text-professional-green" />
          Assign Tester(s)
        </Label>
        <Popover open={testerOpen} onOpenChange={setTesterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={testerOpen}
              className="w-full justify-between professional-input"
            >
              {selectedTesterIds.length === 0
                ? "Select testers..."
                : `${selectedTesterIds.length} tester(s) selected`
              }
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-md border-professional-slate/30">
            <Command>
              <CommandInput placeholder="Search testers..." />
              <CommandList>
                <CommandEmpty>No testers found.</CommandEmpty>
                <CommandGroup>
                  {testers.map((tester) => (
                    <CommandItem
                      key={tester.id}
                      value={tester.name}
                      onSelect={() => onTesterToggle(tester.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTesterIds.includes(tester.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{tester.name}</span>
                        <span className="text-xs text-professional-slate-dark">{tester.role}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedTesters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTesters.map((tester) => (
              <Badge 
                key={tester.id} 
                className="bg-professional-green/10 text-professional-green-dark border-professional-green/30 hover:bg-professional-green/20 transition-colors"
              >
                <TestTube className="h-3 w-3 mr-1" />
                {tester.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
