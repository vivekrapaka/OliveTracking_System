
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone,
  Edit,
  Trash2,
  User,
  MapPin
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Teammates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock data - this will come from your backend API
  const [teammates, setTeammates] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      phone: "+1 (555) 123-4567",
      role: "Senior Frontend Developer",
      department: "Engineering",
      availabilityStatus: "Available",
      location: "New York, NY",
      avatar: "/placeholder.svg",
      tasksAssigned: 3,
      tasksCompleted: 15
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+1 (555) 234-5678",
      role: "Backend Developer",
      department: "Engineering",
      availabilityStatus: "Occupied",
      location: "San Francisco, CA",
      avatar: "/placeholder.svg",
      tasksAssigned: 2,
      tasksCompleted: 12
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      phone: "+1 (555) 345-6789",
      role: "Full Stack Developer",
      department: "Engineering",
      availabilityStatus: "Available",
      location: "Austin, TX",
      avatar: "/placeholder.svg",
      tasksAssigned: 1,
      tasksCompleted: 8
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      phone: "+1 (555) 456-7890",
      role: "UX Designer",
      department: "Design",
      availabilityStatus: "On Leave",
      location: "Seattle, WA",
      avatar: "/placeholder.svg",
      tasksAssigned: 0,
      tasksCompleted: 6
    },
    {
      id: 5,
      name: "Tom Brown",
      email: "tom.brown@company.com",
      phone: "+1 (555) 567-8901",
      role: "DevOps Engineer",
      department: "Engineering",
      availabilityStatus: "Available",
      location: "Boston, MA",
      avatar: "/placeholder.svg",
      tasksAssigned: 2,
      tasksCompleted: 10
    }
  ]);

  const roles = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UX Designer", "DevOps Engineer", "Project Manager"];
  const departments = ["Engineering", "Design", "Product", "Marketing", "Sales"];
  const availabilityStatuses = ["Available", "Occupied", "On Leave"];

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Occupied": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "On Leave": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Engineering": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Design": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Product": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Marketing": return "bg-pink-100 text-pink-800 border-pink-200";
      case "Sales": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const filteredTeammates = teammates.filter(teammate =>
    teammate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teammate.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teammate.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teammate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeammate = () => {
    toast({
      title: "Teammate Added",
      description: "New team member has been added successfully.",
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-600 mt-1">Manage your team and track their availability</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeammate} className="bg-blue-600 hover:bg-blue-700">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-900">{teammates.length}</div>
            <p className="text-sm text-slate-600">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {teammates.filter(t => t.availabilityStatus === "Available").length}
            </div>
            <p className="text-sm text-slate-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {teammates.filter(t => t.availabilityStatus === "Occupied").length}
            </div>
            <p className="text-sm text-slate-600">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-900">
              {teammates.reduce((sum, t) => sum + t.tasksAssigned, 0)}
            </div>
            <p className="text-sm text-slate-600">Active Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-6">
        {filteredTeammates.map((teammate) => (
          <Card key={teammate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={teammate.avatar} alt={teammate.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {getInitials(teammate.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{teammate.name}</h3>
                      <p className="text-slate-600">{teammate.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDepartmentColor(teammate.department)}>
                        {teammate.department}
                      </Badge>
                      <Badge className={getAvailabilityColor(teammate.availabilityStatus)}>
                        {teammate.availabilityStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {teammate.email}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {teammate.phone}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {teammate.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-6 text-sm">
                      <div>
                        <span className="font-medium text-slate-900">{teammate.tasksAssigned}</span>
                        <span className="text-slate-600 ml-1">Active Tasks</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">{teammate.tasksCompleted}</span>
                        <span className="text-slate-600 ml-1">Completed</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeammates.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or add a new team member.</p>
        </div>
      )}
    </div>
  );
};

export default Teammates;
