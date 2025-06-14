
import { DashboardData } from '@/hooks/useDashboardData';

export const mockDashboardData: DashboardData = {
  totalTeammates: 12,
  freeTeammates: 4,
  occupiedTeammates: 8,
  totalTasks: 45,
  activeTasks: 23,
  tasksByStage: {
    "Planning": 8,
    "Development": 12,
    "Review": 6,
    "Testing": 7,
    "SIT": 4,
    "Completed": 8
  },
  tasksByIssueType: {
    "Bug": 15,
    "Feature": 20,
    "Enhancement": 7,
    "Support": 3
  },
  tasksPendingCodeReview: 6,
  tasksPendingCmcApproval: 3,
  recentTasks: [
    {
      id: 1,
      name: "Implement user authentication system",
      stage: "Development",
      assignee: "John Doe",
      dueDate: "2024-01-15",
      priority: "High"
    },
    {
      id: 2,
      name: "Fix payment gateway integration",
      stage: "Testing",
      assignee: "Jane Smith",
      dueDate: "2024-01-12",
      priority: "Critical"
    },
    {
      id: 3,
      name: "Update user profile UI",
      stage: "Review",
      assignee: "Mike Johnson",
      dueDate: "2024-01-18",
      priority: "Medium"
    },
    {
      id: 4,
      name: "Database optimization",
      stage: "Planning",
      assignee: "Sarah Wilson",
      dueDate: "2024-01-20",
      priority: "Low"
    }
  ],
  teamMembersSummary: [
    {
      id: 1,
      name: "John Doe",
      role: "Senior Developer",
      email: "john.doe@company.com",
      phone: "+1-555-0101",
      department: "Engineering",
      location: "New York",
      tasksAssigned: 5
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Frontend Developer",
      email: "jane.smith@company.com",
      phone: "+1-555-0102",
      department: "Engineering",
      location: "San Francisco",
      tasksAssigned: 3
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "UI/UX Designer",
      email: "mike.johnson@company.com",
      phone: "+1-555-0103",
      department: "Design",
      location: "Los Angeles",
      tasksAssigned: 4
    },
    {
      id: 4,
      name: "Sarah Wilson",
      role: "Backend Developer",
      email: "sarah.wilson@company.com",
      phone: "+1-555-0104",
      department: "Engineering",
      location: "Chicago",
      tasksAssigned: 6
    },
    {
      id: 5,
      name: "David Brown",
      role: "DevOps Engineer",
      email: "david.brown@company.com",
      phone: "+1-555-0105",
      department: "Infrastructure",
      location: "Seattle",
      tasksAssigned: 2
    }
  ],
  activeTasksList: [
    {
      id: 5,
      name: "API integration for mobile app",
      stage: "Development",
      assignee: "John Doe",
      dueDate: "2024-01-16",
      priority: "High"
    },
    {
      id: 6,
      name: "Security audit implementation",
      stage: "Review",
      assignee: "Sarah Wilson",
      dueDate: "2024-01-14",
      priority: "Critical"
    },
    {
      id: 7,
      name: "Performance optimization",
      stage: "Testing",
      assignee: "Mike Johnson",
      dueDate: "2024-01-17",
      priority: "Medium"
    }
  ]
};
