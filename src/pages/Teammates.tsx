import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useTeammatesData, BackendTeammate } from "@/hooks/useTeammatesData";
import { AddTeammateForm } from "@/components/AddTeammateForm";
import { EditTeammateForm } from "@/components/EditTeammateForm";
import { useDeleteTeammate } from "@/hooks/useDeleteTeammate";
import { useAuth } from "@/contexts/AuthContext";

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
  projectName: string;
  projectIds: number[];
}

export const Teammates = () => {
  const { user } = useAuth();
  const { data: teammatesApiData, isLoading, error } = useTeammatesData();
  const deleteTeammateMutation = useDeleteTeammate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState<Teammate | null>(null);
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
      tasksCompleted: backendTeammate.tasksCompleted,
      projectName: backendTeammate.projectName || 'Not Assigned',
      projectIds: backendTeammate.projectIds || []
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
      case "Available": return "bg-professional-green text-professional-green-dark border-professional-green-dark";
      case "Occupied": return "bg-professional-red text-professional-red-dark border-professional-red-dark";
      case "On Leave": return "bg-professional-orange text-professional-orange-dark border-professional-orange-dark";
      default: return "bg-professional-gray text-professional-gray-dark border-professional-gray-dark";
    }
  };

  const handleDeleteTeammate = async (teammateName: string) => {
    try {
      await deleteTeammateMutation.mutateAsync(teammateName);
      toast({
        title: "Teammate Deleted",
        description: "Teammate has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teammate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
  };

  const handleEditTeammate = (teammate: Teammate) => {
    setSelectedTeammate(teammate);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedTeammate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-professional-blue border-t-transparent rounded-full" />
          <p className="text-professional-slate-dark">Loading teammates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5">
        <div className="text-professional-red mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load teammates</h3>
          <p className="text-professional-slate-dark mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-professional-blue/5 to-professional-cyan/5 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-professional-lg border border-professional-slate/20">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">Team Members</h1>
          <p className="text-professional-slate-dark mt-1">Manage your team members and their availability</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Add Teammate button - disabled for everyone */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-professional-blue to-professional-cyan hover:from-professional-blue-dark hover:to-professional-cyan-dark text-white shadow-professional" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add Teammate
              </Button>
            </DialogTrigger>
            <AddTeammateForm onSuccess={handleAddSuccess} />
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-professional-slate-dark h-4 w-4" />
          <Input
            placeholder="Search teammates by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-md border-professional-slate/30 focus:border-professional-blue focus:ring-professional-blue/20"
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
              className="text-professional-slate-dark hover:text-professional-blue hover:bg-professional-blue/10"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-professional-slate-dark">
          Showing {filteredTeammates.length} of {teammatesData.length} teammates
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">{teammatesApiData?.totalMembersInTeamCount || 0}</div>
            <p className="text-sm text-professional-slate-dark">Total Team Members</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-professional-green">{teammatesApiData?.availableTeamMembersCount || 0}</div>
            <p className="text-sm text-professional-slate-dark">Available</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional hover:shadow-professional-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-professional-red">{teammatesApiData?.occupiedTeamMembersCount || 0}</div>
            <p className="text-sm text-professional-slate-dark">Occupied</p>
          </CardContent>
        </Card>
      </div>

      {/* Teammates Table */}
      <Card className="bg-white/80 backdrop-blur-md border-professional-slate/20 shadow-professional-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-professional-blue to-professional-cyan bg-clip-text text-transparent">All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-professional-slate/20">
                <TableHead className="text-professional-slate-dark font-semibold">Name</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Role</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Project Name</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Phone</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Status</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Tasks Assigned</TableHead>
                <TableHead className="text-professional-slate-dark font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeammates.map((teammate) => (
                <TableRow key={teammate.id} className="border-professional-slate/10 hover:bg-professional-blue/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="ring-2 ring-professional-blue/20">
                        <AvatarImage src={teammate.avatar} alt={teammate.name} />
                        <AvatarFallback className="bg-gradient-to-br from-professional-blue to-professional-cyan text-white font-semibold">
                          {teammate.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-professional-navy">{teammate.name}</div>
                        <div className="text-sm text-professional-slate-dark">{teammate.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-professional-blue/10 text-professional-blue border-professional-blue/20">
                      {teammate.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-professional-cyan/10 text-professional-cyan-dark border-professional-cyan/20">
                      {teammate.projectName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-professional-slate-dark">{teammate.phone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(teammate.availabilityStatus)}>
                      {teammate.availabilityStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-professional-navy">{teammate.tasksAssigned}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {/* Edit button - only visible to ADMIN and HR */}
                      {(user?.functionalGroup === 'ADMIN' || user?.functionalGroup === 'HR') && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTeammate(teammate)}
                          className="text-professional-blue hover:text-professional-blue-dark hover:bg-professional-blue/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Delete button - only visible to ADMIN and HR */}
                      {(user?.functionalGroup === 'ADMIN' || user?.functionalGroup === 'HR') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-professional-red hover:text-professional-red-dark hover:bg-professional-red/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/95 backdrop-blur-md border-professional-slate/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-professional-navy">Delete Teammate</AlertDialogTitle>
                              <AlertDialogDescription className="text-professional-slate-dark">
                                Are you sure you want to delete "{teammate.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-professional-slate/10">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTeammate(teammate.name)}
                                className="bg-professional-red hover:bg-professional-red-dark text-white"
                                disabled={deleteTeammateMutation.isPending}
                              >
                                {deleteTeammateMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedTeammate && (
          <EditTeammateForm 
            teammate={selectedTeammate} 
            onSuccess={handleEditSuccess} 
          />
        )}
      </Dialog>

      {filteredTeammates.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-xl border border-professional-slate/20">
          <Users className="h-12 w-12 text-professional-slate-dark mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-professional-navy mb-2">No teammates found</h3>
          <p className="text-professional-slate-dark">Try adjusting your search criteria or add a new teammate.</p>
        </div>
      )}
    </div>
  );
};

export default Teammates;
