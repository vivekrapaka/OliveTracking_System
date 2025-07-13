import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useAddTask } from "@/hooks/useAddTask";
import { useEditTask } from "@/hooks/useEditTask";
import { useTaskSequenceNumber } from "@/hooks/useTaskSequenceNumber";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { MultiSelect } from "react-multi-select-component";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any; // Optional, for editing existing tasks
  teammates: any[]; // Pass all teammates for filtering
}

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
  onClose,
  task,
  teammates,
}) => {
  const isEditing = !!task;
  const { mutate: addTask, isLoading: isAdding } = useAddTask();
  const { mutate: editTask, isLoading: isEditingTask } = useEditTask();
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers();

  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    currentStage: "BACKLOG",
    priority: "MEDIUM",
    projectId: "",
    taskType: "TASK",
    receivedDate: new Date(),
    developmentStartDate: undefined,
    testingStartDate: undefined,
    uatTestingStartDate: undefined,
    uatTestingEndDate: undefined,
    productionReleaseDate: undefined,
    developerIds: [],
    testerIds: [],
    developmentDueHours: 0,
    testingDueHours: 0,
    documentPath: "",
  });

  const { data: taskSequenceNumberData } = useTaskSequenceNumber(formData.projectId);

  useEffect(() => {
    if (task) {
      setFormData({
        taskName: task.name || "",
        description: task.description || "",
        currentStage: task.status || "BACKLOG",
        priority: task.priority || "MEDIUM",
        projectId: task.projectId || "",
        taskType: task.taskType || "TASK",
        receivedDate: task.receivedDate ? parseISO(task.receivedDate) : new Date(),
        developmentStartDate: task.developmentStartDate ? parseISO(task.developmentStartDate) : undefined,
        testingStartDate: task.testingStartDate ? parseISO(task.testingStartDate) : undefined,
        uatTestingStartDate: task.uatTestingStartDate ? parseISO(task.uatTestingStartDate) : undefined,
        uatTestingEndDate: task.uatTestingEndDate ? parseISO(task.uatTestingEndDate) : undefined,
        productionReleaseDate: task.productionReleaseDate ? parseISO(task.productionReleaseDate) : undefined,
        developerIds: task.developerIds || [],
        testerIds: task.testerIds || [],
        developmentDueHours: task.developmentDueHours || 0,
        testingDueHours: task.testingDueHours || 0,
        documentPath: task.documentPath || "",
      });
    } else {
      // Reset form for new task
      setFormData({
        taskName: "",
        description: "",
        currentStage: "BACKLOG",
        priority: "MEDIUM",
        projectId: "",
        taskType: "TASK",
        receivedDate: new Date(),
        developmentStartDate: undefined,
        testingStartDate: undefined,
        uatTestingStartDate: undefined,
        uatTestingEndDate: undefined,
        productionReleaseDate: undefined,
        developerIds: [],
        testerIds: [],
        developmentDueHours: 0,
        testingDueHours: 0,
        documentPath: "",
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleDateChange = (id: string, date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [id]: date,
    }));
  };

  const handleMultiSelectChange = (id: string, selectedOptions: any[]) => {
    setFormData((prev) => ({
      ...prev,
      [id]: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      receivedDate: formData.receivedDate?.toISOString(),
      developmentStartDate: formData.developmentStartDate?.toISOString(),
      testingStartDate: formData.testingStartDate?.toISOString(),
      uatTestingStartDate: formData.uatTestingStartDate?.toISOString(),
      uatTestingEndDate: formData.uatTestingEndDate?.toISOString(),
      productionReleaseDate: formData.productionReleaseDate?.toISOString(),
      // Ensure developerIds and testerIds are arrays of numbers
      developerIds: formData.developerIds.map(Number),
      testerIds: formData.testerIds.map(Number),
    };

    if (isEditing) {
      editTask({ taskId: task.id, ...payload });
    } else {
      addTask(payload);
    }
    onClose();
  };

  const developerOptions = teammates
    .filter(t => t.functionalGroup === 'DEVELOPER' || t.functionalGroup === 'DEV_LEAD')
    .map(t => ({ label: t.fullName, value: t.id }));

  const testerOptions = teammates
    .filter(t => t.functionalGroup === 'TESTER' || t.functionalGroup === 'TEST_LEAD')
    .map(t => ({ label: t.fullName, value: t.id }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskName" className="text-right">Task Name</Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectId" className="text-right">Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => handleSelectChange("projectId", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectsData?.projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.projectId && !isEditing && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskNumber" className="text-right">Task Number</Label>
              <Input
                id="taskNumber"
                value={taskSequenceNumberData?.taskNumber || "Generating..."}
                className="col-span-3 bg-gray-100"
                readOnly
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskType" className="text-right">Task Type</Label>
            <Select
              value={formData.taskType}
              onValueChange={(value) => handleSelectChange("taskType", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRD">BRD</SelectItem>
                <SelectItem value="EPIC">Epic</SelectItem>
                <SelectItem value="STORY">Story</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="BUG">Bug</SelectItem>
                <SelectItem value="SUB_TASK">Sub-Task</SelectItem>
                <SelectItem value="ANALYSIS_TASK">Analysis Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentStage" className="text-right">Current Stage</Label>
            <Select
              value={formData.currentStage}
              onValueChange={(value) => handleSelectChange("currentStage", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="ANALYSIS">Analysis</SelectItem>
                <SelectItem value="DEVELOPMENT">Development</SelectItem>
                <SelectItem value="CODE_REVIEW">Code Review</SelectItem>
                <SelectItem value="UAT_TESTING">UAT Testing</SelectItem>
                <SelectItem value="UAT_FAILED">UAT Failed</SelectItem>
                <SelectItem value="READY_FOR_PREPROD">Ready for Pre-Prod</SelectItem>
                <SelectItem value="PREPROD">Pre-Production</SelectItem>
                <SelectItem value="PROD">Production</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discipline-Based Assignment */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="developerIds" className="text-right">Assign Developer(s)</Label>
            <div className="col-span-3">
              <MultiSelect
                options={developerOptions}
                value={developerOptions.filter(option => formData.developerIds.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange("developerIds", selected)}
                labelledBy="Select Developers"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testerIds" className="text-right">Assign Tester(s)</Label>
            <div className="col-span-3">
              <MultiSelect
                options={testerOptions}
                value={testerOptions.filter(option => formData.testerIds.includes(option.value))}
                onChange={(selected) => handleMultiSelectChange("testerIds", selected)}
                labelledBy="Select Testers"
              />
            </div>
          </div>

          {/* Effort Estimation */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="developmentDueHours" className="text-right">Dev Due Hours</Label>
            <Input
              id="developmentDueHours"
              type="number"
              value={formData.developmentDueHours}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testingDueHours" className="text-right">Test Due Hours</Label>
            <Input
              id="testingDueHours"
              type="number"
              value={formData.testingDueHours}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="receivedDate" className="text-right">Received Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.receivedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.receivedDate ? format(formData.receivedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.receivedDate}
                  onSelect={(date) => handleDateChange("receivedDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="developmentStartDate" className="text-right">Dev Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.developmentStartDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.developmentStartDate ? format(formData.developmentStartDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.developmentStartDate}
                  onSelect={(date) => handleDateChange("developmentStartDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testingStartDate" className="text-right">Test Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.testingStartDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.testingStartDate ? format(formData.testingStartDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.testingStartDate}
                  onSelect={(date) => handleDateChange("testingStartDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uatTestingStartDate" className="text-right">UAT Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.uatTestingStartDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.uatTestingStartDate ? format(formData.uatTestingStartDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.uatTestingStartDate}
                  onSelect={(date) => handleDateChange("uatTestingStartDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uatTestingEndDate" className="text-right">UAT End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.uatTestingEndDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.uatTestingEndDate ? format(formData.uatTestingEndDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.uatTestingEndDate}
                  onSelect={(date) => handleDateChange("uatTestingEndDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productionReleaseDate" className="text-right">Prod Release Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.productionReleaseDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.productionReleaseDate ? format(formData.productionReleaseDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.productionReleaseDate}
                  onSelect={(date) => handleDateChange("productionReleaseDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="documentPath" className="text-right">Document Path</Label>
            <Input
              id="documentPath"
              value={formData.documentPath}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isAdding || isEditingTask}>
            {isEditing ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


