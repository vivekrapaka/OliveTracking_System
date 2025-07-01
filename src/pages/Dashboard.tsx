import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Plus,
  RefreshCw,
  WifiOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardLoading } from "@/components/DashboardLoading";
import { mockDashboardData } from "@/services/mockDashboardData";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error, refetch, isRefetching } = useDashboardData();

  if (isLoading) {
    return <DashboardLoading />;
  }

  // Use mock data as fallback when API fails
  const displayData = dashboardData || mockDashboardData;
  const isUsingMockData = !dashboardData;

  if (error) {
    console.error('Dashboard data fetch error:', error);
  }

  // Get project context for display
  const getProjectContext = () => {
    if (user?.role === 'ADMIN') {
      return user?.projectId ? `Dashboard for Project ${user.projectId}` : 'Global Dashboard';
    }
    return user?.projectId ? `Dashboard for Project ${user.projectId}` : 'Dashboard';
  };

  if (!displayData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900">No dashboard data available</h2>
          <p className="text-slate-600">Please check your connection and try again.</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const calculateCompletionRate = () => {
    if (!displayData?.tasksByStage || !displayData?.totalTasks || displayData.totalTasks === 0) {
      return 0;
    }
    
    const completedTasks = displayData.tasksByStage["Completed"] || 0;
    return Math.round((completedTasks / displayData.totalTasks) * 100);
  };

  const completionRate = calculateCompletionRate();

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH": return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      case "CRITICAL": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toUpperCase()) {
      case "PLANNING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DEVELOPMENT": return "bg-purple-100 text-purple-800 border-purple-200";
      case "REVIEW": return "bg-orange-100 text-orange-800 border-orange-200";
      case "TESTING": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "SIT": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Only show offline data banner when using mock data */}
      {isUsingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Using offline data - API connection failed
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Check if your backend server is running on localhost:8085
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{getProjectContext()}</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your Kotak project:</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/tasks">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{displayData.totalTasks}</div>
            <p className="text-xs text-slate-600 mt-1">All tasks in system</p>
          </CardContent>
        </Card>

        {/* Active Tasks Card */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Tasks</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{displayData.activeTasks}</div>
                <p className="text-xs text-slate-600 mt-1">In progress</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Active Tasks ({displayData.activeTasks})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {displayData.activeTasksList.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs font-bold border border-gray-600">
                        {task.taskNumber}
                      </div>
                      <h3 className="font-medium text-slate-900">{task.name}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {task.assignee}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStageColor(task.stage)}>
                      {task.stage}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Team Members Card */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Team Members</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{displayData.totalTeammates}</div>
                <p className="text-xs text-slate-600 mt-1">{displayData.freeTeammates} free, {displayData.occupiedTeammates} occupied</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Team Members ({displayData.totalTeammates})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {displayData.teamMembersSummary.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">{member.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{member.role}</span>
                      <span>{member.email}</span>
                      <span>{member.location}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {member.tasksAssigned} tasks assigned
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Completion Rate Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-slate-600 mt-1">
              {displayData.tasksByStage?.["Completed"] || 0} of {displayData.totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Tasks</CardTitle>
            <Link to="/tasks">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="bg-gray-800 text-white px-2 py-1 rounded font-mono text-xs font-bold border border-gray-600">
                      {task.taskNumber}
                    </div>
                    <h3 className="font-medium text-slate-900">{task.name}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {task.assignee}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStageColor(task.stage)}>
                    {task.stage}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
