
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Activity,
  Target,
  Zap,
  Timer,
  Award,
  User,
  Briefcase
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Helper function to safely format dates
const formatSafeDate = (dateString: string, formatStr: string = "MMM dd") => {
  try {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    if (!isValid(date)) return "N/A";
    return format(date, formatStr);
  } catch (error) {
    console.warn("Invalid date format:", dateString);
    return "N/A";
  }
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-professional-blue border-t-transparent mx-auto"></div>
          <p className="text-professional-slate-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-professional-red mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-professional-slate-dark">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-professional-slate-dark">No dashboard data available</p>
      </div>
    );
  }

  // Prepare chart data
 const tasksByStageData = Object.entries(data.tasksByStage || {}).map(([stage, count]) => ({
  name: stage.replace(/_/g, ' '),
  value: count,
  count
}));

const tasksByTypeData = Object.entries(data.tasksByIssueType || {}).map(([type, count]) => ({
  name: type,
  value: count
}));

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  return (
    <div className="space-y-8 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5 min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-professional-slate/20 p-6 shadow-professional">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-professional-slate-dark mt-2 text-lg">
              Welcome back, <span className="font-semibold text-professional-navy">{user?.fullName}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-professional-slate-dark">
              Last updated: {formatSafeDate(new Date().toISOString(), "PPP")}
            </p>
            <Badge className="bg-professional-green/10 text-professional-green-dark border-professional-green/30 mt-2">
              {user?.functionalGroup?.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-md p-1 rounded-xl border border-professional-slate/20 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
            { id: 'team', label: 'Team', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-gradient-to-r from-professional-blue to-professional-cyan text-white shadow-professional"
                  : "text-professional-slate-dark hover:bg-professional-slate/10"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="professional-card professional-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Total Tasks</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">
                        {data.totalTasks}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-professional-blue/20 to-professional-cyan/20 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-professional-blue" />
                    </div>
                  </div>
                  <p className="text-xs text-professional-slate-dark mt-2">
                    <span className="text-professional-green">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="professional-card professional-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Active Tasks</p>
                      <p className="text-3xl font-bold text-professional-orange">
                        {data.activeTasks}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-professional-orange/20 to-professional-red/20 rounded-xl flex items-center justify-center">
                      <Activity className="h-6 w-6 text-professional-orange" />
                    </div>
                  </div>
                  <p className="text-xs text-professional-slate-dark mt-2">
                    <span className="text-professional-blue">85%</span> completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="professional-card professional-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Team Members</p>
                      <p className="text-3xl font-bold text-professional-green">
                        {data.totalTeammates}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-professional-green/20 to-professional-cyan/20 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-professional-green" />
                    </div>
                  </div>
                  <p className="text-xs text-professional-slate-dark mt-2">
                    <span className="text-professional-green">{data.freeTeammates}</span> available
                  </p>
                </CardContent>
              </Card>

              <Card className="professional-card professional-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Pending Reviews</p>
                      <p className="text-3xl font-bold text-professional-purple">
                        {data.tasksPendingCodeReview}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-professional-purple/20 to-professional-indigo/20 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-professional-purple" />
                    </div>
                  </div>
                  <p className="text-xs text-professional-slate-dark mt-2">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tasks by Stage */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-professional-navy">
                    <BarChart3 className="h-5 w-5 text-professional-blue" />
                    Tasks by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tasksByStageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="url(#blueGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tasks by Type */}
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-professional-navy">
                    <Zap className="h-5 w-5 text-professional-cyan" />
                    Tasks by Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={tasksByTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tasksByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Recent Tasks */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-professional-navy">
                  <CheckCircle2 className="h-5 w-5 text-professional-green" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentTasks?.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-professional-blue/5 to-professional-cyan/5 rounded-lg border border-professional-slate/20">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-professional-blue"></div>
                        <div>
                          <p className="font-medium text-professional-navy">{task.name}</p>
                          <p className="text-sm text-professional-slate-dark">
                            Assigned to: {task.assignee} • Due: {formatSafeDate(task.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "text-xs",
                          task.priority === 'HIGH' ? "bg-professional-red/10 text-professional-red-dark border-professional-red/30" :
                          task.priority === 'MEDIUM' ? "bg-professional-yellow/10 text-professional-yellow-dark border-professional-yellow/30" :
                          "bg-professional-green/10 text-professional-green-dark border-professional-green/30"
                        )}>
                          {task.priority}
                        </Badge>
                        <Badge className="bg-professional-blue/10 text-professional-blue-dark border-professional-blue/30 text-xs">
                          {task.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks List */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-professional-navy">
                  <Activity className="h-5 w-5 text-professional-orange" />
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.activeTasksList?.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 hover:bg-professional-slate/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4 text-professional-slate-dark" />
                        <div>
                          <p className="font-medium text-professional-navy">{task.name}</p>
                          <p className="text-xs text-professional-slate-dark">Task #{task.taskNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-professional-navy">{task.assignee}</p>
                        <p className="text-xs text-professional-slate-dark">{task.stage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Total Members</p>
                      <p className="text-2xl font-bold text-professional-blue">{data.totalTeammates}</p>
                    </div>
                    <Users className="h-8 w-8 text-professional-blue" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Available</p>
                      <p className="text-2xl font-bold text-professional-green">{data.freeTeammates}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-professional-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-professional-slate-dark">Occupied</p>
                      <p className="text-2xl font-bold text-professional-orange">{data.occupiedTeammates}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-professional-orange" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Members List */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-professional-navy">
                  <Award className="h-5 w-5 text-professional-purple" />
                  Team Members Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.teamMembersSummary?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-professional-slate/5 to-professional-blue/5 rounded-lg border border-professional-slate/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-professional-blue to-professional-cyan rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-professional-navy">{member.name}</p>
                          <p className="text-sm text-professional-slate-dark">{member.role} • {member.department}</p>
                          <p className="text-xs text-professional-slate-dark">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-professional-navy">
                          {member.tasksAssigned} tasks assigned
                        </p>
                        <p className="text-xs text-professional-slate-dark">{member.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
