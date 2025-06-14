import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  X,
  User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useTeammatesData, BackendTeammate } from "@/hooks/useTeammatesData";

interface Teammate {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  department: string;
  location: string;
  avatar: string;
  availabilityStatus: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

export const Teammates = () => {
  const { data: teammatesApiData, isLoading, error } = useTeammatesData();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeammate, setEditingTeammate] = useState<Teammate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Convert backend data to frontend format
  const convertBackendToFrontend = (backendTeammate: BackendTeammate): Teammate => {
    return {
      id: backendTeammate.id,
      name: backendTeammate.name,
      email: backendTeammate.email,
      role: backendTeammate.role,
      phone: backendTeammate.phone,
      department: backendTeammate.department,
      location: backendTeammate.location,
      avatar: backendTeammate.avatar,
      availabilityStatus: backendTeammate.availabilityStatus,
      tasksAssigned: backendTeammate.tasksAssigned,
      tasksCompleted: backendTeammate.tasksCompleted
    };
  };

  // Convert API data to component state
  const apiTeammatesData = teammatesApiData?.teammates?.map(convertBackendToFrontend) || [];
  const [teammatesData, setTeammatesData] = useState<Teammate[]>([]);

  // Update local state when API data changes
  useEffect(() => {
    if (apiTeammatesData.length > 0) {
      setTeammatesData(apiTeammatesData);
    }
  }, [apiTeammatesData]);

  // Form states for teammate creation/editing
  const [teammateName, setTeammateName] = useState("");
  const [teammateEmail, setTeammateEmail] = useState("");
  const [teammateRole, setTeammateRole] = useState("");
  const [teammatePhone, setTeammatePhone] = useState("");
  const [teammateDepartment, setTeammateDepartment] = useState("");
  const [teammateLocation, setTeammateLocation] = useState("");
  const [teammateAvatar, setTeammateAvatar] = useState("");
  const [teammateAvailabilityStatus, setTeammateAvailabilityStatus] = useState("");
  const [teammateTasksAssigned, setTeammateTasksAssigned] = useState(0);
  const [teammateTasksCompleted, setTeammateTasksCompleted] = useState(0);

  const roles = ["Developer", "Designer", "Manager", "Tester", "Analyst"];
  const departments = ["Engineering", "Design", "Management", "QA", "Business Analysis"];
  const statuses = ["Available", "Occupied", "On Leave"];

  // Filter teammates based on search and filters
  const filteredTeammates = teammatesData.filter(teammate => {
    const matchesSearch = searchTerm === "" ||
      teammate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teammate.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(teammate.role);
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(teammate.department);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(teammate.availabilityStatus);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Filter options for dropdowns
  const filterOptions = {
    roles: [...new Set(teammatesData.map(t => t.role))].map(r => ({
      label: r,
      value: r,
      count: teammatesData.filter(t => t.role === r).length
    })),
    departments: [...new Set(teammatesData.map(t => t.department))].map(d => ({
      label: d,
      value: d,
      count: teammatesData.filter(t => t.department === d).length
    })),
    statuses: [...new Set(teammatesData.map(t => t.availabilityStatus))].map(s => ({
      label: s,
      value: s,
      count: teammatesData.filter(t => t.availabilityStatus === s).length
    }))
  };

  const activeFiltersCount = selectedRoles.length + selectedDepartments.length + selectedStatuses.length;

  const clearAllFilters = () => {
    setSelectedRoles([]);
    setSelectedDepartments([]);
    setSelectedStatuses([]);
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Occupied": return "bg-red-100 text-red-800 border-red-200";
      case "On Leave": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleEditTeammate = (teammate: Teammate) => {
    setEditingTeammate(teammate);
    setIsEditModalOpen(true);
  };

  const handleDeleteTeammate = (teammateId: number) => {
    setTeammatesData(teammatesData.filter(teammate => teammate.id !== teammateId));
    toast({
      title: "Teammate Deleted",
      description: "Teammate has been deleted successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading teammates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load teammates</h3>
          <p className="text-slate-600 mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Members</h1>
          <p className="text-slate-600 mt-1">Manage your team members and their availability</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Teammate
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search teammates by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <FilterDropdown
            title="Role"
            options={filterOptions.roles}
            selectedValues={selectedRoles}
            onSelectionChange={setSelectedRoles}
          />
          <FilterDropdown
            title="Department"
            options={filterOptions.departments}
            selectedValues={selectedDepartments}
            onSelectionChange={setSelectedDepartments}
          />
          <FilterDropdown
            title="Status"
            options={filterOptions.statuses}
            selectedValues={selectedStatuses}
            onSelectionChange={setSelectedStatuses}
          />

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredTeammates.length} of {teammatesData.length} teammates
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-900">{teammatesApiData?.totalMembersInTeamCount || 0}</div>
            <p className="text-sm text-slate-600">Total Team Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{teammatesApiData?.availableTeamMembersCount || 0}</div>
            <p className="text-sm text-slate-600">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">{teammatesApiData?.occupiedTeamMembersCount || 0}</div>
            <p className="text-sm text-slate-600">Occupied</p>
          </CardContent>
        </Card>
      </div>

      {/* Teammates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks Assigned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeammates.map((teammate) => (
                <TableRow key={teammate.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={teammate.avatar} alt={teammate.name} />
                        <AvatarFallback>{teammate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{teammate.name}</div>
                        <div className="text-sm text-slate-600">{teammate.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{teammate.role}</TableCell>
                  <TableCell>{teammate.department}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(teammate.availabilityStatus)}>
                      {teammate.availabilityStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{teammate.tasksAssigned}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTeammate(teammate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Teammate</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{teammate.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTeammate(teammate.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredTeammates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No teammates found</h3>
          <p className="text-slate-600">Try adjusting your search criteria or add a new teammate.</p>
        </div>
      )}
    </div>
  );
};

export default Teammates;
