
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useRoles } from '@/hooks/useRoles';
import { toast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    roleId: '',
    projectIds: []
  });

  // React Query hooks
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Check if user has admin or HR permissions using functionalGroup
  if (!["ADMIN", "HR"].includes(user?.functionalGroup)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...formData };

      // Validate required fields
      if (!userData.roleId) {
        toast({
          title: "Error",
          description: "Role selection is required",
          variant: "destructive",
        });
        return;
      }

      // Find the selected role to check if it needs projects
      const selectedRole = roles.find(role => role.id === parseInt(userData.roleId));
      if (selectedRole && !["ADMIN", "HR"].includes(selectedRole.functionalGroup)) {
        if (!userData.projectIds || userData.projectIds.length === 0) {
          toast({
            title: "Error",
            description: "Project assignment is required for this role",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Clear project assignments for ADMIN/HR roles
        userData.projectIds = [];
      }

      await createUserMutation.mutateAsync(userData);
      setIsCreateDialogOpen(false);
      setFormData({ fullName: '', email: '', phone: '', location: '', password: '', roleId: '', projectIds: [] });
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const userData = { ...formData };

      // Remove password if empty (optional for update)
      if (!userData.password) {
        delete userData.password;
      }

      // Validate required fields
      if (!userData.roleId) {
        toast({
          title: "Error",
          description: "Role selection is required",
          variant: "destructive",
        });
        return;
      }

      // Find the selected role to check if it needs projects
      const selectedRole = roles.find(role => role.id === parseInt(userData.roleId));
      if (selectedRole && !["ADMIN", "HR"].includes(selectedRole.functionalGroup)) {
        if (!userData.projectIds || userData.projectIds.length === 0) {
          toast({
            title: "Error",
            description: "Project assignment is required for this role",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Clear project assignments for ADMIN/HR roles
        userData.projectIds = [];
      }

      await updateUserMutation.mutateAsync({ 
        id: editingUser.id, 
        userData 
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setFormData({ fullName: '', email: '', phone: '', location: '', password: '', roleId: '', projectIds: [] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      fullName: userToEdit.fullName || '',
      email: userToEdit.email || '',
      phone: userToEdit.phone || '',
      location: userToEdit.location || '',
      password: '',
      roleId: userToEdit.roleId ? userToEdit.roleId.toString() : '',
      projectIds: userToEdit.projectIds || []
    });
    setIsEditDialogOpen(true);
  };

  const getProjectNames = (projectIds) => {
    if (!projectIds || projectIds.length === 0) return 'Global / N/A';
    const names = projectIds
      .map((id) => projects.find((p) => p.id === id)?.projectName)
      .filter(Boolean);
    return names.length ? names.join(", ") : "Unknown Project(s)";
  };

  const getRoleBadgeColor = (functionalGroup) => {
    switch (functionalGroup) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "HR":
        return "bg-purple-100 text-purple-800";
      case "MANAGER":
      case "DEV_LEAD":
        return "bg-blue-100 text-blue-800";
      case "BUSINESS_ANALYST":
        return "bg-green-100 text-green-800";
      case "TESTER":
      case "TEST_LEAD":
        return "bg-yellow-100 text-yellow-800";
      case "DEVELOPER":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedRole = roles.find(role => role.id === parseInt(formData.roleId));
  const shouldShowProjects = selectedRole && !["ADMIN", "HR"].includes(selectedRole.functionalGroup);

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading || projectsLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Error Loading Users</h2>
          <p className="text-slate-600">{usersError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value, projectIds: [] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.title} ({role.functionalGroup})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {shouldShowProjects && (
                <div>
                  <Label>Assigned Projects *</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`project-${project.id}`}
                          checked={formData.projectIds.includes(project.id)}
                          onCheckedChange={(checked) => {
                            const newProjectIds = checked
                              ? [...formData.projectIds, project.id]
                              : formData.projectIds.filter((id) => id !== project.id);
                            setFormData({ ...formData, projectIds: newProjectIds });
                          }}
                        />
                        <Label htmlFor={`project-${project.id}`} className="text-sm">
                          {project.projectName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Functional Group</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-slate-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>{user.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-100 text-slate-800">
                        {user.roleTitle || user.role || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.functionalGroup)}>
                        {user.functionalGroup || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getProjectNames(user.projectIds)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{user.fullName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value, projectIds: [] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.title} ({role.functionalGroup})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {shouldShowProjects && (
              <div>
                <Label>Assigned Projects *</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-project-${project.id}`}
                        checked={formData.projectIds.includes(project.id)}
                        onCheckedChange={(checked) => {
                          const newProjectIds = checked
                            ? [...formData.projectIds, project.id]
                            : formData.projectIds.filter((id) => id !== project.id);
                          setFormData({ ...formData, projectIds: newProjectIds });
                        }}
                      />
                      <Label htmlFor={`edit-project-${project.id}`} className="text-sm">
                        {project.projectName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
