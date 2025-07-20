
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
import { CalendarIcon, FileText, Clock, Users, Download, BarChart3, User, Calendar as CalendarDaily, AlertTriangle, UserCheck, Crown } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

interface TaskLog {
  taskName: string;
  hours: number;
}

interface DailyLog {
  date: string;
  totalHours: number;
  taskLogs: TaskLog[];
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
  devManagerName?: string;
  testManagerName?: string;
  developerNames: string[];
  testerNames: string[];
  developmentDueHours?: number;
  testingDueHours?: number;
  developerEffort?: Array<{
    teammateName: string;
    hoursLogged: number;
  }>;
  testerEffort?: Array<{
    teammateName: string;
    hoursLogged: number;
  }>;
  breakdown: {
    developmentHours: number;
    testingHours: number;
    otherHours: number;
  };
}

// Add normalization function
const normalizeTimesheetData = (data) => {
  if (!data || !Array.isArray(data.dailyLogs)) return data;
  return {
    ...data,
    dailyLogs: data.dailyLogs.map(day => ({
      ...day,
      taskLogs: Array.isArray(day.breakdown?.taskDetails)
        ? day.breakdown.taskDetails.map(t => ({
            taskName: t.taskName,
            hours: t.hours,
            comments: t.comments,
          }))
        : [],
      taskHours: day.breakdown?.taskHours ?? 0,
      generalHours: day.breakdown?.generalHours ?? 0,
    })),
  };
};

const Reports = () => {
  const { user } = useAuth();
  const { data: teammatesData, isLoading: teammatesLoading } = useTeammatesData();
  const { data: tasksData, isLoading: tasksLoading } = useTasksData();

  // Teammate Timesheet States
  const [selectedTeammateId, setSelectedTeammateId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isGeneratingTimesheetReport, setIsGeneratingTimesheetReport] = useState(false);
  const [timesheetReportData, setTimesheetReportData] = useState<TimesheetResponse | null>(null);
  const [isDownloadingTimesheetPDF, setIsDownloadingTimesheetPDF] = useState(false);

  // Task Summary States
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isGeneratingTaskReport, setIsGeneratingTaskReport] = useState(false);
  const [taskReportData, setTaskReportData] = useState<TaskTimeSummaryResponse | null>(null);
  const [isDownloadingTaskPDF, setIsDownloadingTaskPDF] = useState(false);

  // Check if user has access to reports
  const hasReportAccess = user?.functionalGroup && [
    'ADMIN', 'MANAGER', 'DEV_MANAGER', 'TEST_MANAGER', 'DEV_LEAD', 'TEST_LEAD'
  ].includes(user.functionalGroup);

  if (!hasReportAccess) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-lg shadow-xl border-0 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-lg leading-relaxed">
              You need manager or lead privileges to access the Advanced Reports section.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the correct teammates array from the API response structure
  const teammates = teammatesData?.teammates || [];
  const tasks = tasksData?.tasks || [];

  console.log('Teammates data:', teammates);
  console.log('Tasks data:', tasks);

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
        description: "Please select a teammate and date range to generate the report.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingTimesheetReport(true);
    setTimesheetReportData(null);
    
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      console.log('Generating timesheet report with correct teammate ID:', {
        teammateId: selectedTeammateId,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });

      const response = await apiClient.get('/api/reports/timesheet', {
        params: {
          teammateId: selectedTeammateId,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      console.log('Timesheet report response:', response.data);
      setTimesheetReportData(normalizeTimesheetData(response.data));
      
      toast({
        title: "Report Generated Successfully",
        description: `Timesheet report generated for ${response.data.teammateName}.`,
      });
    } catch (error) {
      console.error('Error generating timesheet report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate the timesheet report. Please try again.",
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
        description: "Please select a task to generate the summary report.",
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
        title: "Report Generated Successfully",
        description: `Task summary report generated for ${response.data.taskName}.`,
      });
    } catch (error) {
      console.error('Error generating task report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate the task summary report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTaskReport(false);
    }
  };

  // Authenticated PDF download for timesheet
  const downloadTimesheetPDF = async () => {
    if (!selectedTeammateId || !startDate || !endDate || !timesheetReportData) {
      toast({
        title: "Cannot Download PDF",
        description: "Please generate a timesheet report first before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingTimesheetPDF(true);

    try {
      const token = localStorage.getItem('jwtToken');
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const url = `${apiClient.defaults.baseURL}/api/reports/timesheet/pdf?teammateId=${selectedTeammateId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      
      console.log('Downloading PDF from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pdfBlob = await response.blob();
      const fileURL = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `timesheet_${timesheetReportData.teammateName.replace(/\s+/g, '_')}_${formattedStartDate}_to_${formattedEndDate}.pdf`;
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);

      toast({
        title: "PDF Downloaded",
        description: "Timesheet PDF has been downloaded successfully.",
      });

    } catch (error) {
      console.error('Error downloading timesheet PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the timesheet PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingTimesheetPDF(false);
    }
  };

  // Authenticated PDF download for task summary
  const downloadTaskPDF = async () => {
    if (!selectedTaskId || !taskReportData) {
      toast({
        title: "Cannot Download PDF",
        description: "Please generate a task summary report first before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadingTaskPDF(true);

    try {
      const token = localStorage.getItem('jwtToken');
      const url = `${apiClient.defaults.baseURL}/api/reports/task-summary/${selectedTaskId}/pdf`;
      
      console.log('Downloading task PDF from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pdfBlob = await response.blob();
      const fileURL = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `task_summary_${taskReportData.taskName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);

      toast({
        title: "PDF Downloaded",
        description: "Task summary PDF has been downloaded successfully.",
      });

    } catch (error) {
      console.error('Error downloading task PDF:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the task summary PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingTaskPDF(false);
    }
  };

  const canGenerateTimesheetReport = selectedTeammateId && startDate && endDate && !isGeneratingTimesheetReport;
  const canGenerateTaskReport = selectedTaskId && !isGeneratingTaskReport;

  if (teammatesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page Header with Enhanced Design */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl shadow-lg border border-primary/20">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Advanced Reports & Analytics
            </h1>
            <p className="text-xl text-muted-foreground mt-2 font-medium">
              Generate comprehensive timesheets and task summaries with authenticated PDF exports
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-2 rounded-xl border border-primary/20">
          <User className="h-5 w-5 text-primary" />
          <div className="text-right">
            <div className="font-semibold text-foreground">{user?.fullName}</div>
            <div className="text-sm text-muted-foreground">{user?.functionalGroup}</div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Design */}
      <Tabs defaultValue="timesheet" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:w-[500px] h-14 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
          <TabsTrigger 
            value="timesheet" 
            className="flex items-center space-x-3 font-semibold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="h-5 w-5" />
            <span>Teammate Timesheet</span>
          </TabsTrigger>
          <TabsTrigger 
            value="task-summary" 
            className="flex items-center space-x-3 font-semibold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-5 w-5" />
            <span>Task Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Teammate Timesheet Tab */}
        <TabsContent value="timesheet" className="space-y-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
              <CardTitle className="flex items-center space-x-4 text-2xl">
                <CalendarDaily className="h-7 w-7 text-primary" />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Daily Teammate Timesheet Report
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Generate detailed timesheet reports for individual team members with comprehensive daily hour breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* Enhanced Filter Controls */}
              <div className="grid gap-10 lg:grid-cols-3">
                {/* Teammate Selection */}
                <div className="space-y-4">
                  <label className="text-base font-bold text-foreground flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <span>Select Teammate *</span>
                  </label>
                  <Select 
                    value={selectedTeammateId?.toString()} 
                    onValueChange={(value) => {
                      const teammateId = Number(value);
                      console.log('Selected teammate ID:', teammateId);
                      setSelectedTeammateId(teammateId);
                      setTimesheetReportData(null);
                    }}
                  >
                    <SelectTrigger className="h-12 border-2 border-primary/30 focus:border-primary focus:ring-primary/20 bg-background/80">
                      <SelectValue placeholder="Choose a team member..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {teammates.map((teammate) => (
                        <SelectItem key={teammate.id} value={teammate.id.toString()}>
                          <div className="flex items-center space-x-4 py-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm" />
                            <div>
                              <div className="font-semibold text-foreground">{teammate.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {teammate.role} • {teammate.department} 
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-4">
                  <label className="text-base font-bold text-foreground flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>Start Date *</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary bg-background/80",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setTimesheetReportData(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-4">
                  <label className="text-base font-bold text-foreground flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span>End Date *</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal border-2 border-primary/30 focus:border-primary bg-background/80",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setTimesheetReportData(null);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Enhanced Date Presets */}
              <div className="space-y-4">
                <label className="text-base font-bold text-foreground">Quick Date Ranges</label>
                <div className="flex flex-wrap gap-4">
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
                      onClick={() => {
                        setDatePreset(preset.value);
                        setTimesheetReportData(null);
                      }}
                      className="border-primary/40 hover:bg-primary/10 hover:border-primary hover:text-primary font-semibold"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-primary/20">
                <Button
                  onClick={generateTimesheetReport}
                  disabled={!canGenerateTimesheetReport}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-3 h-12 font-semibold text-base shadow-lg"
                >
                  {isGeneratingTimesheetReport ? (
                    <>
                      <Clock className="mr-3 h-5 w-5 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-3 h-5 w-5" />
                      Generate Timesheet Report
                    </>
                  )}
                </Button>
                <Button
                  onClick={downloadTimesheetPDF}
                  disabled={!timesheetReportData || isDownloadingTimesheetPDF}
                  variant="outline"
                  className="border-green-400 hover:bg-green-50 hover:border-green-500 hover:text-green-700 px-8 py-3 h-12 font-semibold text-base"
                >
                  {isDownloadingTimesheetPDF ? (
                    <>
                      <Clock className="mr-3 h-5 w-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-3 h-5 w-5" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Timesheet Report Display */}
          {timesheetReportData && Array.isArray(timesheetReportData.dailyLogs) ? (
            <Card className="border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-primary/10 border-b border-green-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {timesheetReportData.teammateName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-foreground mb-1">
                        {timesheetReportData.teammateName}
                      </CardTitle>
                      <div className="text-gray-600 text-lg font-medium">
                        {(() => {
                          const teammate = teammates.find(t => t.id === timesheetReportData.teammateId);
                          return teammate ? `${teammate.role} • ${teammate.department}` : '';
                        })()}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {startDate && endDate && `${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-5xl font-extrabold text-primary">
                      {timesheetReportData.totalHoursForPeriod}h
                    </div>
                    <div className="text-gray-500 font-medium">Total Hours</div>
                    <div className="w-40 mt-2">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `${Math.min((timesheetReportData.totalHoursForPeriod / ((timesheetReportData.dailyLogs ?? []).length || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {`Target: ${(8 * ((timesheetReportData.dailyLogs ?? []).length || 1))}h`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {/* Professional Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-700">Days Worked:</span>
                      <span className="text-2xl font-bold text-primary">
                        {(timesheetReportData.dailyLogs ?? []).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-700">Average Hours/Day:</span>
                      <span className="text-2xl font-bold text-primary">
                        {(
                          timesheetReportData.totalHoursForPeriod /
                          ((timesheetReportData.dailyLogs ?? []).length || 1)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-700">Days Below Target:</span>
                      <span className="text-2xl font-bold text-red-500">
                        {(timesheetReportData.dailyLogs ?? []).filter(d => d.totalHours < 8).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-gray-700">Days Target Met/Exceeded:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {(timesheetReportData.dailyLogs ?? []).filter(d => d.totalHours >= 8).length}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end justify-end">
                    <Button
                      onClick={downloadTimesheetPDF}
                      disabled={isDownloadingTimesheetPDF}
                      variant="outline"
                      className="border-green-400 hover:bg-green-50 hover:border-green-500 hover:text-green-700 px-8 py-3 h-12 font-semibold text-base"
                    >
                      {isDownloadingTimesheetPDF ? (
                        <>
                          <Clock className="mr-3 h-5 w-5 animate-spin" /> Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="mr-3 h-5 w-5" /> Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {/* Daily Breakdown Table */}
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Daily Work Log</h3>
                  <div className="border-2 border-primary/20 rounded-2xl overflow-x-auto shadow-xl">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                        <TableRow>
                          <TableHead className="font-bold text-foreground py-6 text-base">Date</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Total Hours</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Task Breakdown</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(timesheetReportData.dailyLogs ?? []).map((log, index) => (
                          <TableRow
                            key={index}
                            className={cn(
                              "transition-all duration-200 hover:shadow-md",
                              log.totalHours < 8
                                ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500"
                                : "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500"
                            )}
                          >
                            <TableCell className="font-semibold py-6 text-base">
                              {format(new Date(log.date), "EEEE, PPP")}
                            </TableCell>
                            <TableCell className="py-6">
                              <span
                                className={cn(
                                  "font-bold text-xl",
                                  log.totalHours < 8 ? "text-red-600" : "text-green-600"
                                )}
                              >
                                {log.totalHours} hours
                              </span>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="space-y-1">
                                {log.taskLogs.length === 0 ? (
                                  <span className="text-gray-400 italic">No tasks logged</span>
                                ) : (
                                  log.taskLogs.map((taskLog, taskIndex) => (
                                    <div key={taskIndex} className="flex flex-col gap-0.5 bg-white/80 px-2 py-1 rounded border mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-800">{taskLog.taskName}</span>
                                        <span className="ml-auto text-gray-600">{taskLog.hours}h</span>
                                        {taskLog.taskName.toLowerCase().includes('general') && (
                                          <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">General</span>
                                        )}
                                      </div>
                                      {taskLog.comments && (
                                        <div className="text-xs text-gray-500 italic pl-2 border-l-2 border-gray-200">
                                          {taskLog.comments}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-6">
                              <span
                                className={cn(
                                  "px-4 py-2 rounded-full text-sm font-bold shadow-sm",
                                  log.totalHours < 8
                                    ? "bg-red-200 text-red-800 border border-red-300"
                                    : "bg-green-200 text-green-800 border border-green-300"
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
                  {(timesheetReportData.dailyLogs ?? []).length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Clock className="h-20 w-20 mx-auto mb-6 opacity-50" />
                      <p className="text-xl font-semibold">No work logs found for the selected period.</p>
                      <p className="text-lg mt-2">The selected teammate may not have logged any hours during this time.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-red-500 py-8">
              No timesheet data available for the selected teammate and period.
            </div>
          )}
        </TabsContent>

        {/* Task Summary Tab */}
        <TabsContent value="task-summary" className="space-y-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-secondary/5 via-background to-primary/5">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-secondary/20">
              <CardTitle className="flex items-center space-x-4 text-2xl">
                <FileText className="h-7 w-7 text-secondary" />
                <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Task Time Summary Report
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Generate comprehensive time breakdowns for specific tasks across all disciplines and team members
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* Task Selection */}
              <div className="space-y-4">
                <label className="text-base font-bold text-foreground flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-secondary" />
                  <span>Select Task *</span>
                </label>
                <Select 
                  value={selectedTaskId?.toString()} 
                  onValueChange={(value) => {
                    const taskId = Number(value);
                    console.log('Selected task ID:', taskId);
                    setSelectedTaskId(taskId);
                    setTaskReportData(null);
                  }}
                >
                  <SelectTrigger className="h-12 border-2 border-secondary/30 focus:border-secondary focus:ring-secondary/20 bg-background/80">
                    <SelectValue placeholder="Choose a task..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id.toString()}>
                        <div className="flex items-center space-x-4 py-2">
                          <div className={cn(
                            "w-4 h-4 rounded-full shadow-sm",
                            task.status === 'COMPLETED' ? "bg-gradient-to-r from-green-400 to-green-600" :
                            task.status === 'IN_PROGRESS' ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                            task.status === 'PENDING' ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : 
                            "bg-gradient-to-r from-gray-400 to-gray-600"
                          )} />
                          <div>
                            <div className="font-semibold text-foreground">{task.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.taskNumber} • {task.projectName} • {task.status} • Priority: {task.priority}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-secondary/20">
                <Button
                  onClick={generateTaskReport}
                  disabled={!canGenerateTaskReport}
                  className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground px-8 py-3 h-12 font-semibold text-base shadow-lg"
                >
                  {isGeneratingTaskReport ? (
                    <>
                      <Clock className="mr-3 h-5 w-5 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-3 h-5 w-5" />
                      Generate Task Report
                    </>
                  )}
                </Button>
                <Button
                  onClick={downloadTaskPDF}
                  disabled={!taskReportData || isDownloadingTaskPDF}
                  variant="outline"
                  className="border-green-400 hover:bg-green-50 hover:border-green-500 hover:text-green-700 px-8 py-3 h-12 font-semibold text-base"
                >
                  {isDownloadingTaskPDF ? (
                    <>
                      <Clock className="mr-3 h-5 w-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-3 h-5 w-5" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Task Report Display */}
          {taskReportData && (
            <Card className="border-0 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-secondary/20">
                <CardTitle className="text-2xl flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span>Time Summary for Task: {taskReportData.taskName}</span>
                </CardTitle>
                <CardDescription className="text-lg">
                  Comprehensive breakdown of effort across all disciplines and team members
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {/* Enhanced Summary */}
                <div className="bg-gradient-to-br from-secondary/15 via-secondary/10 to-primary/15 border-2 border-secondary/30 rounded-2xl p-8 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Total Hours Logged</h3>
                      <p className="text-5xl font-bold text-secondary mt-4">{taskReportData.totalHours} hours</p>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl shadow-lg">
                      <Clock className="h-12 w-12 text-secondary" />
                    </div>
                  </div>
                </div>

                {/* Management Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {taskReportData.devManagerName && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Crown className="h-5 w-5 text-blue-600" />
                        <h4 className="font-bold text-blue-800">Development Manager</h4>
                      </div>
                      <p className="text-blue-700 font-semibold">{taskReportData.devManagerName}</p>
                    </div>
                  )}
                  {taskReportData.testManagerName && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        <h4 className="font-bold text-purple-800">Test Manager</h4>
                      </div>
                      <p className="text-purple-700 font-semibold">{taskReportData.testManagerName}</p>
                    </div>
                  )}
                </div>

                {/* Team Members - REPLACE THIS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Development Effort */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <h4 className="font-bold text-green-800">Development Effort</h4>
                    </div>
                    <div className="mb-2 text-sm text-gray-700 font-semibold">
                      Due Hours: {taskReportData.developmentDueHours || 0}h
                    </div>
                    <table className="w-full text-left mb-2">
                      <thead>
                        <tr>
                          <th className="py-1 pr-2">Developer</th>
                          <th className="py-1 pr-2">Hours Logged</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(taskReportData.developerEffort || []).map((dev, idx) => (
                          <tr key={idx}>
                            <td className="py-1 pr-2">{dev.teammateName}</td>
                            <td className="py-1 pr-2">{dev.hoursLogged} h</td>
                          </tr>
                        ))}
                        {/* Total row for developers */}
                        <tr className="font-bold border-t">
                          <td className="py-1 pr-2 text-right">Total</td>
                          <td className="py-1 pr-2">
                            {taskReportData.developerEffort ? taskReportData.developerEffort.reduce((sum, d) => sum + d.hoursLogged, 0) : 0} h
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="text-xs text-gray-600 font-semibold">
                      Total Dev Hours: {taskReportData.developerEffort ? taskReportData.developerEffort.reduce((sum, d) => sum + d.hoursLogged, 0) : 0} / {taskReportData.developmentDueHours || 0} (Estimated)
                    </div>
                  </div>
                  {/* Testing Effort */}
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <UserCheck className="h-5 w-5 text-orange-600" />
                      <h4 className="font-bold text-orange-800">Testing Effort</h4>
                    </div>
                    <div className="mb-2 text-sm text-gray-700 font-semibold">
                      Due Hours: {taskReportData.testingDueHours || 0}h
                    </div>
                    <table className="w-full text-left mb-2">
                      <thead>
                        <tr>
                          <th className="py-1 pr-2">Tester</th>
                          <th className="py-1 pr-2">Hours Logged</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(taskReportData.testerEffort || []).map((tester, idx) => (
                          <tr key={idx}>
                            <td className="py-1 pr-2">{tester.teammateName}</td>
                            <td className="py-1 pr-2">{tester.hoursLogged} h</td>
                          </tr>
                        ))}
                        {/* Total row for testers */}
                        <tr className="font-bold border-t">
                          <td className="py-1 pr-2 text-right">Total</td>
                          <td className="py-1 pr-2">
                            {taskReportData.testerEffort ? taskReportData.testerEffort.reduce((sum, t) => sum + t.hoursLogged, 0) : 0} h
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="text-xs text-gray-600 font-semibold">
                      Total Test Hours: {taskReportData.testerEffort ? taskReportData.testerEffort.reduce((sum, t) => sum + t.hoursLogged, 0) : 0} / {taskReportData.testingDueHours || 0} (Estimated)
                    </div>
                  </div>
                </div>

                {/* Enhanced Breakdown Table */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-foreground">Effort Breakdown by Discipline</h3>
                  <div className="border-2 border-secondary/20 rounded-2xl overflow-hidden shadow-xl">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
                        <TableRow>
                          <TableHead className="font-bold text-foreground py-6 text-base">Discipline</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Hours Logged</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Due Hours</TableHead>
                          <TableHead className="font-bold text-foreground py-6 text-base">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500 transition-all duration-200">
                          <TableCell className="font-semibold py-6 text-base flex items-center space-x-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm" />
                            <span>Development Hours</span>
                          </TableCell>
                          {(() => {
                            const devLogged = taskReportData.developerEffort ? taskReportData.developerEffort.reduce((sum, d) => sum + d.hoursLogged, 0) : 0;
                            const devDue = taskReportData.developmentDueHours || 0;
                            const over = devLogged > devDue;
                            return (
                              <TableCell className={`py-6 ${over ? 'bg-red-100 text-red-700 font-bold border border-red-400' : ''}`}>
                                <span className={`font-bold text-xl ${over ? 'text-red-700' : 'text-blue-600'}`}>
                                  {devLogged} hours
                                </span>
                              </TableCell>
                            );
                          })()}
                          <TableCell className="py-6">
                            <span className="font-bold text-xl text-blue-600">
                              {taskReportData.developmentDueHours || 0} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            {(() => {
                              const devLogged = taskReportData.developerEffort ? taskReportData.developerEffort.reduce((sum, d) => sum + d.hoursLogged, 0) : 0;
                              const devDue = taskReportData.developmentDueHours || 0;
                              if (devDue === 0) return <span className="text-base text-gray-400">N/A</span>;
                              if (devLogged < devDue) return <span className="text-base font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Under: {(devDue - devLogged).toFixed(1)} h less</span>;
                              if (devLogged === devDue) return <span className="text-base font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">On Time</span>;
                              if (devLogged > devDue) return <span className="text-base font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">Over: {(devLogged - devDue).toFixed(1)} h extra</span>;
                            })()}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500 transition-all duration-200">
                          <TableCell className="font-semibold py-6 text-base flex items-center space-x-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm" />
                            <span>Testing Hours</span>
                          </TableCell>
                          {(() => {
                            const testLogged = taskReportData.testerEffort ? taskReportData.testerEffort.reduce((sum, t) => sum + t.hoursLogged, 0) : 0;
                            const testDue = taskReportData.testingDueHours || 0;
                            const over = testLogged > testDue;
                            return (
                              <TableCell className={`py-6 ${over ? 'bg-red-100 text-red-700 font-bold border border-red-400' : ''}`}>
                                <span className={`font-bold text-xl ${over ? 'text-red-700' : 'text-green-600'}`}>
                                  {testLogged} hours
                                </span>
                              </TableCell>
                            );
                          })()}
                          <TableCell className="py-6">
                            <span className="font-bold text-xl text-green-600">
                              {taskReportData.testingDueHours || 0} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            {(() => {
                              const testLogged = taskReportData.testerEffort ? taskReportData.testerEffort.reduce((sum, t) => sum + t.hoursLogged, 0) : 0;
                              const testDue = taskReportData.testingDueHours || 0;
                              if (testDue === 0) return <span className="text-base text-gray-400">N/A</span>;
                              if (testLogged < testDue) return <span className="text-base font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Under: {(testDue - testLogged).toFixed(1)} h less</span>;
                              if (testLogged === testDue) return <span className="text-base font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">On Time</span>;
                              if (testLogged > testDue) return <span className="text-base font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">Over: {(testLogged - testDue).toFixed(1)} h extra</span>;
                            })()}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-gray-50 hover:bg-gray-100 border-l-4 border-l-gray-500 transition-all duration-200">
                          <TableCell className="font-semibold py-6 text-base flex items-center space-x-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-sm" />
                            <span>Other Hours</span>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="font-bold text-xl text-gray-600">
                              {(taskReportData.breakdown?.otherHours ?? 0)} hours
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="font-bold text-xl text-gray-600">-</span>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="text-base font-semibold text-muted-foreground">
                                                             {taskReportData.breakdown?.otherHours > 0 && ((taskReportData.developmentDueHours || 0) > 0 || (taskReportData.testingDueHours || 0) > 0)
                                ? "-"
                                : "0%"}
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
