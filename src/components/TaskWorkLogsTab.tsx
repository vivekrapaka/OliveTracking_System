
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

interface WorkLog {
  id: number;
  hoursSpent: number;
  logDate: string;
  description: string;
  teammateName: string;
}

interface TaskWorkLogsTabProps {
  taskId: number;
}
const fetchWorkLogs = async (taskId: number) => {
  const url = `/api/tasks/${taskId}/worklogs`;
  
  console.log('Adding task with data:', );
  
  try {
    const response = await apiClient.get(url);
    console.log('fetch the hostory', response.data);
    return response.data;
  } catch (error) {
    console.error('history api:', error);
    throw error;
  }
};

/*const fetchWorkLogs = async (taskId: number): Promise<WorkLog[]> => {
  const response = await apiClient.get(`/api/tasks/${taskId}/worklogs`);
  return response.data;
}; */

const logWork = async (taskId: number, workLogData: { hoursSpent: number; logDate: string; description: string }) => {
  const url = `/api/tasks/${taskId}/worklogs`;
  
  console.log('Adding task with data:', workLogData);
  
  try {
    const response = await apiClient.post(url,workLogData);
    console.log('fetch the workLogData', response.data);
    return response.data;
  } catch (error) {
    console.error('history workLogData:', error);
    throw error;
  }
};
/*const logWork = async (taskId: number, workLogData: { hoursSpent: number; logDate: string; description: string }) => {
  const response = await apiClient.post(`/api/tasks/${taskId}/worklogs`, workLogData);
  return response.data;
}; */

export const TaskWorkLogsTab = ({ taskId }: TaskWorkLogsTabProps) => {
  const [hoursSpent, setHoursSpent] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: workLogs = [], isLoading } = useQuery({
    queryKey: ['task-worklogs', taskId],
    queryFn: () => fetchWorkLogs(taskId),
  });

  const logWorkMutation = useMutation({
    mutationFn: (workLogData: { hoursSpent: number; logDate: string; description: string }) => 
      logWork(taskId, workLogData),
    onSuccess: () => {
      setHoursSpent("");
      setDescription("");
      setSelectedDate(new Date());
      queryClient.invalidateQueries({ queryKey: ['task-worklogs', taskId] });
      toast({
        title: "Work Logged",
        description: "Your work time has been logged successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log work. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogWork = () => {
    if (!hoursSpent || !description.trim()) {
      toast({
        title: "Error",
        description: "Please enter hours spent and description.",
        variant: "destructive",
      });
      return;
    }

    const hours = parseFloat(hoursSpent);
    if (isNaN(hours) || hours <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number for hours spent.",
        variant: "destructive",
      });
      return;
    }

    logWorkMutation.mutate({
      hoursSpent: hours,
      logDate: format(selectedDate, "yyyy-MM-dd"),
      description: description.trim(),
    });
  };

  const totalHours = workLogs.reduce((sum, log) => sum + log.hoursSpent, 0);

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Time Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {totalHours.toFixed(1)} hours
          </div>
          <p className="text-sm text-slate-600">Total time logged</p>
        </CardContent>
      </Card>

      {/* Log Work Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursSpent">Hours Spent</Label>
              <Input
                id="hoursSpent"
                type="number"
                step="0.5"
                min="0.1"
                placeholder="e.g., 1.5"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Work Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workDescription">Description</Label>
            <Textarea
              id="workDescription"
              placeholder="Describe the work you completed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleLogWork}
              disabled={logWorkMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {logWorkMutation.isPending ? "Logging..." : "Log Time"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Log History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-slate-500">Loading work logs...</div>
            </div>
          ) : workLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-500">No work logged yet</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teammate</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.teammateName}</TableCell>
                    <TableCell>{log.hoursSpent} hrs</TableCell>
                    <TableCell>{format(new Date(log.logDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="max-w-xs truncate" title={log.description}>
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
