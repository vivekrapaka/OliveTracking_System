
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
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  // Mock data - this will come from your backend API
  const stats = {
    totalTasks: 24,
    completedTasks: 18,
    activeTasks: 6,
    teammates: 8,
    completionRate: 75
  };

  const recentTasks = [
    { id: 1, name: "User Authentication System", stage: "Development", assignee: "John Doe", dueDate: "2024-06-15", priority: "High" },
    { id: 2, name: "Database Schema Design", stage: "Review", assignee: "Jane Smith", dueDate: "2024-06-12", priority: "Medium" },
    { id: 3, name: "Frontend Dashboard", stage: "Testing", assignee: "Mike Johnson", dueDate: "2024-06-18", priority: "High" },
    { id: 4, name: "API Documentation", stage: "Planning", assignee: "Sarah Wilson", dueDate: "2024-06-20", priority: "Low" }
  ];

  // Mock data for all tasks (normally this would come from your API)
  const allTasks = [
    ...recentTasks,
    { id: 5, name: "User Interface Design", stage: "Completed", assignee: "Alice Brown", dueDate: "2024-06-10", priority: "High" },
    { id: 6, name: "Database Migration", stage: "Completed", assignee: "Bob Wilson", dueDate: "2024-06-08", priority: "Medium" },
    { id: 7, name: "API Testing", stage: "Development", assignee: "Carol Davis", dueDate: "2024-06-22", priority: "Low" },
    { id: 8, name: "Security Audit", stage: "Planning", assignee: "David Miller", dueDate: "2024-06-25", priority: "High" },
    // Add more mock tasks to reach 24 total
    ...Array.from({ length: 16 }, (_, i) => ({
      id: i + 9,
      name: `Task ${i + 9}`,
      stage: ["Planning", "Development", "Review", "Testing", "Completed"][Math.floor(Math.random() * 5)],
      assignee: ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Alice Brown"][Math.floor(Math.random() * 5)],
      dueDate: "2024-06-30",
      priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)]
    }))
  ];

  const activeTasks = allTasks.filter(task => task.stage !== "Completed");
  
  // Mock team members data
  const teamMembers = [
    { id: 1, name: "John Doe", role: "Frontend Developer", email: "john@example.com", tasksAssigned: 5 },
    { id: 2, name: "Jane Smith", role: "Backend Developer", email: "jane@example.com", tasksAssigned: 4 },
    { id: 3, name: "Mike Johnson", role: "UI/UX Designer", email: "mike@example.com", tasksAssigned: 3 },
    { id: 4, name: "Sarah Wilson", role: "Project Manager", email: "sarah@example.com", tasksAssigned: 6 },
    { id: 5, name: "Alice Brown", role: "QA Engineer", email: "alice@example.com", tasksAssigned: 2 },
    { id: 6, name: "Bob Wilson", role: "DevOps Engineer", email: "bob@example.com", tasksAssigned: 2 },
    { id: 7, name: "Carol Davis", role: "Frontend Developer", email: "carol@example.com", tasksAssigned: 1 },
    { id: 8, name: "David Miller", role: "Security Specialist", email: "david@example.com", tasksAssigned: 1 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Planning": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Development": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Review": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Testing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">🏦 Welcome back! Here's what's happening with your Kotak project:</p>
        </div>
        <Link to="/tasks">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks Card */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.totalTasks}</div>
                <p className="text-xs text-slate-600 mt-1">+2 from last week</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Tasks ({allTasks.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {allTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">{task.name}</h3>
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

        {/* Active Tasks Card */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Tasks</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.activeTasks}</div>
                <p className="text-xs text-slate-600 mt-1">In progress</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Active Tasks ({activeTasks.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">{task.name}</h3>
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
                <div className="text-2xl font-bold text-slate-900">{stats.teammates}</div>
                <p className="text-xs text-slate-600 mt-1">Active members</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Team Members ({teamMembers.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">{member.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{member.role}</span>
                      <span>{member.email}</span>
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

        {/* Completion Rate Card (non-clickable) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
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
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-1">{task.name}</h3>
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
