
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeammatesData } from '@/hooks/useTeammatesData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Clock, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';
import { useQuery } from '@tanstack/react-query';

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

const Reports = () => {
  const { user } = useAuth();
  const { data: teammatesData } = useTeammatesData();
  
  // Filter states
  const [selectedTeammateId, setSelectedTeammateId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<TimesheetResponse | null>(null);

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

  const generateReport = async () => {
    if (!selectedTeammateId || !startDate || !endDate) {
      return;
    }

    setIsGeneratingReport(true);
    try {
      const response = await apiClient.get('/api/reports/timesheet', {
        params: {
          teammateId: selectedTeammateId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const canGenerateReport = selectedTeammateId && startDate && endDate;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-jira-blue/10 rounded-lg">
          <FileText className="h-6 w-6 text-jira-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Timesheets</h1>
          <p className="text-muted-foreground">Track team member work hours and daily progress</p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-jira-blue/5 to-jira-purple/5 border-b border-border/50">
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Users className="h-5 w-5 text-jira-blue" />
            <span>Report Filters</span>
          </CardTitle>
          <CardDescription>Select teammate and date range to generate timesheet report</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Teammate Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teammate *</label>
              <Select 
                value={selectedTeammateId?.toString()} 
                onValueChange={(value) => setSelectedTeammateId(Number(value))}
              >
                <SelectTrigger className="border-border/60 focus:border-jira-blue focus:ring-jira-blue/20">
                  <SelectValue placeholder="Select a teammate" />
                </SelectTrigger>
                <SelectContent>
                  {teammates.map((teammate) => (
                    <SelectItem key={teammate.id} value={teammate.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-jira-green rounded-full" />
                        <span>{teammate.name}</span>
                        <span className="text-xs text-muted-foreground">({teammate.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-border/60 focus:border-jira-blue",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick start date"}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal border-border/60 focus:border-jira-blue",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick end date"}
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quick Date Ranges</label>
            <div className="flex flex-wrap gap-2">
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
                  className="border-border/60 hover:bg-jira-blue/10 hover:border-jira-blue"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={generateReport}
              disabled={!canGenerateReport || isGeneratingReport}
              className="bg-jira-blue hover:bg-jira-blue/90 text-white"
            >
              {isGeneratingReport ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-jira-green/5 to-jira-blue/5 border-b border-border/50">
            <CardTitle className="text-foreground">
              Timesheet for {reportData.teammateName}
            </CardTitle>
            <CardDescription>
              Period: {startDate && format(startDate, "PPP")} to {endDate && format(endDate, "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Summary Box */}
            <div className="bg-gradient-to-r from-jira-blue/10 to-jira-purple/10 border border-jira-blue/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Total Hours for Period</h3>
                  <p className="text-2xl font-bold text-jira-blue">{reportData.totalHoursForPeriod} hours</p>
                </div>
                <div className="p-3 bg-jira-blue/20 rounded-full">
                  <Clock className="h-6 w-6 text-jira-blue" />
                </div>
              </div>
            </div>

            {/* Daily Log Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Daily Work Log</h3>
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
                  <div className="grid grid-cols-2 gap-4 font-medium text-foreground">
                    <span>Date</span>
                    <span>Total Hours Logged</span>
                  </div>
                </div>
                <div className="divide-y divide-border/30">
                  {reportData.dailyLogs.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        "px-4 py-3 grid grid-cols-2 gap-4 transition-colors",
                        log.totalHours < 8
                          ? "bg-jira-red/10 border-l-4 border-l-jira-red"
                          : "bg-jira-green/5 border-l-4 border-l-jira-green hover:bg-jira-green/10"
                      )}
                    >
                      <span className="text-foreground font-medium">
                        {format(new Date(log.date), "EEEE, PPP")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={cn(
                            "font-semibold",
                            log.totalHours < 8 ? "text-jira-red" : "text-jira-green"
                          )}
                        >
                          {log.totalHours} hours
                        </span>
                        {log.totalHours < 8 && (
                          <span className="text-xs bg-jira-red/20 text-jira-red px-2 py-1 rounded">
                            Below target
                          </span>
                        )}
                        {log.totalHours >= 8 && (
                          <span className="text-xs bg-jira-green/20 text-jira-green px-2 py-1 rounded">
                            Target met
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {reportData.dailyLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No work logs found for the selected period.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
