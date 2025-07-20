import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTasksData } from '@/hooks/useTasksData';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/apiClient';

interface LogActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneralActivityTask {
  id: number;
  name: string;
  taskNumber: string;
  taskType: string;
  projectId: number;
  projectName: string;
}

const LogActivityDialog: React.FC<LogActivityDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { data: tasksData } = useTasksData();
  
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>('');
  const [hoursSpent, setHoursSpent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalActivities, setGeneralActivities] = useState<GeneralActivityTask[]>([]);

  // Get unique projects from user's projectNames
  const userProjects = user?.projectNames || [];

  // Fetch general activities when project is selected
  const [projectTasks, setProjectTasks] = useState<GeneralActivityTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      if (!selectedProject) {
        setProjectTasks([]);
        setSelectedActivity('');
        return;
      }

      setIsLoadingTasks(true);
      try {
        // Use the new API endpoint
        const response = await apiClient.get('/api/tasks/general-activities');
        // Filter by selected project
        const filteredTasks = response.data?.filter((task: any) => 
          task.projectName === selectedProject
        ) || [];
        setProjectTasks(filteredTasks);
        setSelectedActivity('');
      } catch (error) {
        console.error('Error fetching general activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities for the selected project.",
          variant: "destructive"
        });
        setProjectTasks([]);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    fetchProjectTasks();
  }, [selectedProject]);

  // Check if description is required
  const isDescriptionRequired = Boolean(selectedActivity && 
    projectTasks.find(activity => activity.id.toString() === selectedActivity)?.name &&
    !projectTasks.find(activity => activity.id.toString() === selectedActivity)?.name.includes('Idle Time'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !selectedActivity || !hoursSpent || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (isDescriptionRequired && !description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description for this activity.",
        variant: "destructive"
      });
      return;
    }

    const hours = parseFloat(hoursSpent);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      toast({
        title: "Invalid Hours",
        description: "Please enter a valid number of hours (1-24).",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await apiClient.post(`/api/tasks/${selectedActivity}/worklogs`, {
        hoursSpent: hours,
        logDate: formattedDate,
        description: description.trim() || undefined
      });

      console.log('Log activity response:', response.data);
      
      toast({
        title: "Success",
        description: "Activity logged successfully!"
      });

      // Reset form and close dialog
      handleClose();
    } catch (error: any) {
      console.error('Log activity error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to log activity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProject('');
    setSelectedActivity('');
    setHoursSpent('');
    setSelectedDate(new Date());
    setDescription('');
    setGeneralActivities([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span>Log General Activity</span>
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Record your time spent on non-task activities like meetings, training, or analysis work.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Project Selection */}
          <div className="space-y-3">
            <Label htmlFor="project" className="text-base font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Project *
            </Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white">
                <SelectValue placeholder="Choose a project to associate with this activity" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {userProjects.map((project) => (
                  <SelectItem key={project} value={project} className="py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">{project}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Selection */}
          <div className="space-y-3">
            <Label htmlFor="activity" className="text-base font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Activity Type *
            </Label>
            <Select 
              value={selectedActivity} 
              onValueChange={setSelectedActivity}
              disabled={!selectedProject || isLoadingTasks}
            >
              <SelectTrigger className="h-12 border-2 border-gray-300 focus:border-green-500 focus:ring-green-500/20 bg-white">
                <SelectValue placeholder={
                  !selectedProject ? "Please select a project first" :
                  isLoadingTasks ? "Loading activities..." :
                  "Choose an activity type"
                } />
                {isLoadingTasks && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {projectTasks.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id.toString()} className="py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">{activity.name}</span>
                        <p className="text-xs text-gray-500 mt-1">Task #{activity.taskNumber}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && !isLoadingTasks && projectTasks.length === 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No general activities found for this project. Please contact your administrator to create general activity tasks.
                </p>
              </div>
            )}
          </div>

          {/* Hours Spent */}
          <div className="space-y-3">
            <Label htmlFor="hours" className="text-base font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Hours Spent *
            </Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              placeholder="Enter hours (e.g., 2.5)"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              className="h-12 border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 bg-white text-lg"
              required
            />
            <p className="text-sm text-gray-600">
              Enter the number of hours spent on this activity (0.5 to 24 hours)
            </p>
          </div>

          {/* Date Picker */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 bg-white",
                    !selectedDate && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
                  {selectedDate ? format(selectedDate, "EEEE, MMMM do, yyyy") : "Select the date for this activity"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Description / Comment {isDescriptionRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="description"
              placeholder={isDescriptionRequired ? "Please provide a detailed description of what you worked on..." : "Optional: Add any additional details about this activity..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white resize-none"
              required={isDescriptionRequired}
            />
            {isDescriptionRequired && (
              <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Description Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This activity type requires a detailed description of the work performed.
                  </p>
                </div>
              </div>
            )}
            {!isDescriptionRequired && (
              <p className="text-sm text-gray-600">
                Providing a description helps with project tracking and reporting.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="h-12 px-8 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedProject || !selectedActivity || !hoursSpent || !selectedDate || (isDescriptionRequired && !description.trim())}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging Activity...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Log Activity</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogActivityDialog; 