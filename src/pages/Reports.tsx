
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeammatesData } from '@/hooks/useTeammatesData';
import { useTasksData } from '@/hooks/useTasksData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, FileText, Clock, Users, Download, BarChart3, User, Calendar as CalendarDaily } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

interface DailyLog {
  date: string;
  totalHours: number;
}

interface TimesheetResponse {
  teammateId: number;
  teammateName: string;
  totalHoursForPeriod: number;
  dailyLogs: DailyLog[];
}

interface TaskTimeSummaryResponse {
  taskId: number;
  taskName: string;
  totalHours: number;
  breakdown: {
    developmentHours: number;
    testingHours: number;
    otherHours: number;
  };
}

const Reports = () => {
  const { user } = useAuth();
  const { data: teammatesData } = useTeammatesData();
  const { data: tasksData } = useTasksData();

  // Teammate Timesheet States
  const [selectedTeammateId, setSelectedTeammateId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isGeneratingTimesheetReport, setIsGeneratingTimesheetReport] = useState(false);
  const [timesheetReportData, setTimesheetReportData] = useState<TimesheetResponse | null>(null);

  // Task Summary States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isGeneratingTaskReport, setIsGeneratingTaskReport] = useState(false);
  const [taskReportData, setTaskReportData] = useState<TaskTimeSummaryResponse | null>(null);

  // Check if user has access to reports
  const hasReportAccess = user?.functionalGroup && [
    'ADMIN', 'MANAGER', 'DEV_MANAGER', 'TEST_MANAGER', 'DEV_LEAD', 'TEST_LEAD'
  ].includes(user.functionalGroup);

  if (!hasReportAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access the Reports section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teammates = teammatesData?.teammates || [];
  const tasks = tasksData?.tasks || [];

  const setDatePreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case 'thisWeek':
        setStartDate(startOfWeek(now, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(now, { weekStartsOn: 1 }));
        break;
      case 'lastWeek':
        const lastWeek = subWeeks(now, 1);
        setStartDate(startOfWeek(lastWeek, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(lastWeek, { weekStartsOn: 1 }));
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
    }
  };

  const generateTimesheetReport = async () => {
    if (!selectedTeammateId || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select a teammate and date range.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTimesheetReport(true);
    setTimesheetReportData(null);
    
    try {
      console.log('Generating timesheet report with params:', {
        teammateId: selectedTeammateId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      const response = await apiClient.get('/api/reports/timesheet', {
        params: {
          teammateId: selectedTeammateId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      
      console.log('Timesheet report response:', response.data);
      setTimesheetReportData(response.data);
      
      toast({
        title: "Success",
        description: "Timesheet report generated successfully.",
      });
    } catch (error) {
      console.error('Error generating timesheet report:', error);
      toast({
        title: "Error",
        description: "Failed to generate timesheet report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTimesheetReport(false);
    }
  };

  const generateTaskReport = async () => {
    if (!selectedTaskId) {
      toast({
        title: "Missing Information",
        description: "Please select a task.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTaskReport(true);
    setTaskReportData(null);
    
    try {
      console.log('Generating task report for taskId:', selectedTaskId);

      const response = await apiClient.get(`/api/reports/task-summary/${selectedTaskId}`);
      
      console.log('Task report response:', response.data);
      setTaskReportData(response.data);
      
      toast({
        title: "Success",
        description: "Task summary report generated successfully.",
      });
    } catch (error) {
      console.error('Error generating task report:', error);
      toast({
        title: "Error",
        description: "Failed to generate task summary report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTaskReport(false);
    }
  };

  const downloadTimesheetPDF = () => {
    if (!selectedTeammateId || !startDate || !endDate) {
      toast({
        title: "Cannot Download",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    const url = `/api/reports/timesheet/pdf?teammateId=${selectedTeammateId}&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
    window.open(`${apiClient.defaults.baseURL}${url}`, '_blank');
  };

  const downloadTaskPDF = () => {
    if (!selectedTaskId) {
      toast({
        title: "Cannot Download",
        description: "Please generate a report first.",
        variant: "destructive",
      });
      return;
    }

    const url = `/api/reports/task-summary/${selectedTaskId}/pdf`;
    window.open(`${apiClient.defaults.baseURL}${url}`, '_blank');
  };

  const canGenerateTimesheetReport = selectedTeammateId && startDate && endDate;
  const canGenerateTaskReport = selectedTaskId;

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Advanced Reports & Analytics</h1>
            <p className="text-lg text-muted-foreground mt-1">Generate comprehensive timesheets and task summaries with PDF exports</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.fullName} ({user?.functionalGroup})</span>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="timesheet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-12">
          <TabsTrigger value="timesheet" className="flex items-center space-x-2 font-medium">
            <Users className="h-4 w-4" />
            <span>Teammate Timesheet</span>
          </TabsTrigger>
          <TabsTrigger value="task-summary" className="flex items-center space-x-2 font-medium">
            <FileText className="h-4 w-4" />
            <span>Task Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Teammate Timesheet Tab */}
        <TabsContent value="timesheet" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <CardHeader className="bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <CalendarDaily className="h-6 w-6 text-blue-600" />
                <span>Daily Teammate Timesheet Report</span>
              </CardTitle>
              <CardDescription className="text-base">
                Generate detailed timesheet reports for individual team members with daily hour breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Filter Controls */}
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Teammate Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Select Teammate *</span>
                  </label>
                  <Select 
                    value={selectedTeammateId?.toString()} 
                    onValueChange={(value) => setSelectedTeammateId(Number(value))}
                  >
                    <SelectTrigger className="h-11 border-2 border-border/60 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Choose a team member..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {teammates.map((teammate) => (
                        <SelectItem key={teammate.id} value={teammate.id.toString()}>
                          <div className="flex items-center space-x-3 py-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <div>
                              <div className="font-medium">{teammate.name}</div>
                              <div className="text-xs text-muted-foreground">{teammate.role} • {teammate.department}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span>Start Date *</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start text-left font-normal border-2 border-border/60 focus:border-blue-500",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span>End Date *</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 w-full justify-start text-left font-normal border-2 border-border/60 focus:border-blue-500",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Date Presets */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Quick Date Ranges</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'This Week', value: 'thisWeek' },
                    { label: 'Last Week', value: 'lastWeek' },
                    { label: 'This Month', value: 'thisMonth' },
                    { label: 'Last Month', value: 'lastMonth' }
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset(preset.value)}
                      className="border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-4">
                  <Button
                    onClick={generateTimesheetReport}
                    disabled={!canGenerateTimesheetReport || isGeneratingTimesheetReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-11"
                  >
                    {isGeneratingTimesheetReport ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  onClick={downloadTimesheetPDF}
                  disabled={!timesheetReportData}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 px-6 py-2 h-11"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timesheet Report Display */}
          {timesheetReportData && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600/5 to-blue-600/5 border-b">
                <CardTitle className="text-xl">
                  Timesheet Report for {timesheetReportData.teammateName}
                </CardTitle>
                <CardDescription className="text-base">
                  Period: {startDate && format(startDate, "PPP")} to {endDate && format(endDate, "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Total Hours for Period</h3>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{timesheetReportData.totalHoursForPeriod} hours</p>
                    </div>
                    <div className="p-4 bg-blue-600/20 rounded-full">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Daily Log Table */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Daily Work Log</h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-semibold text-foreground py-4">Date</TableHead>
                          <TableHead className="font-semibold text-foreground py-4">Total Hours Logged</TableHead>
                          <TableHead className="font-semibold text-foreground py-4">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timesheetReportData.dailyLogs.map((log, index) => (
                          <TableRow
                            key={index}
                            className={cn(
                              "transition-colors",
                              log.totalHours < 8
                                ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500"
                                : "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500"
                            )}
                          >
                            <TableCell className="font-medium py-4">
                              {format(new Date(log.date), "EEEE, PPP")}
                            </TableCell>
                            <TableCell className="py-4">
                              <span
                                className={cn(
                                  "font-bold text-lg",
                                  log.totalHours < 8 ? "text-red-600" : "text-green-600"
                                )}
                              >
                                {log.totalHours} hours
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-semibold",
                                  log.totalHours < 8
                                    ? "bg-red-200 text-red-800"
                                    : "bg-green-200 text-green-800"
                                )}
                              >
                                {log.totalHours < 8 ? "Below Target" : "Target Met"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {timesheetReportData.dailyLogs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No work logs found for the selected period.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Task Summary Tab */}
        <TabsContent value="task-summary" className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <CardHeader className="bg-gradient-to-r from-purple-600/5 to-pink-600/5 border-b">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <FileText className="h-6 w-6 text-purple-600" />
                <span>Task Time Summary Report</span>
              </CardTitle>
              <CardDescription className="text-base">
                Generate comprehensive time breakdowns for specific tasks across all disciplines
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Task Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Select Task *</span>
                </label>
                <Select 
                  value={selectedTaskId?.toString()} 
                  onValueChange={(value) => setSelectedTaskId(Number(value))}
                >
                  <SelectTrigger className="h-11 border-2 border-border/60 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue placeholder="Choose a task..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        <div className="flex items-center space-x-3 py-1">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            task.status === 'COMPLETED' ? "bg-green-500" :
                            task.status === 'IN_PROGRESS' ? "bg-blue-500" :
                            task.status === 'PENDING' ? "bg-yellow-500" : "bg-gray-500"
                          )} />
                          <div>
                            <div className="font-medium">{task.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.taskNumber} • {task.projectName} • {task.status}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-4">
                  <Button
                    onClick={generateTaskReport}
                    disabled={!canGenerateTaskReport || isGeneratingTaskReport}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 h-11"
                  >
                    {isGeneratingTaskReport ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  onClick={downloadTaskPDF}
                  disabled={!taskReportData}
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 px-6 py-2 h-11"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Report Display */}
          {taskReportData && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600/5 to-pink-600/5 border-b">
                <CardTitle className="text-xl">
                  Time Summary for Task: {taskReportData.taskName}
                </CardTitle>
                <CardDescription className="text-base">
                  Comprehensive breakdown of effort across all disciplines
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Summary */}
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Total Hours Logged</h3>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{taskReportData.totalHours} hours</p>
                    </div>
                    <div className="p-4 bg-purple-600/20 rounded-full">
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Effort Breakdown by Discipline</h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-semibold text-foreground py-4">Discipline</TableHead>
                          <TableHead className="font-semibold text-foreground py-4">Hours Logged</TableHead>
                          <TableHead className="font-semibold text-foreground py-4">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500">
                          <TableCell className="font-medium py-4 flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span>Development Hours</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-bold text-lg text-blue-600">
                              {taskReportData.breakdown.developmentHours} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {taskReportData.totalHours > 0 
                                ? ((taskReportData.breakdown.developmentHours / taskReportData.totalHours) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500">
                          <TableCell className="font-medium py-4 flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span>Testing Hours</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-bold text-lg text-green-600">
                              {taskReportData.breakdown.testingHours} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {taskReportData.totalHours > 0 
                                ? ((taskReportData.breakdown.testingHours / taskReportData.totalHours) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-gray-50 hover:bg-gray-100 border-l-4 border-l-gray-500">
                          <TableCell className="font-medium py-4 flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full" />
                            <span>Other Hours</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-bold text-lg text-gray-600">
                              {taskReportData.breakdown.otherHours} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {taskReportData.totalHours > 0 
                                ? ((taskReportData.breakdown.otherHours / taskReportData.totalHours) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
