
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAddTeammate, AddTeammateRequest } from "@/hooks/useAddTeammate";
import { toast } from "@/hooks/use-toast";

interface AddTeammateFormProps {
  onSuccess?: () => void;
}

export const AddTeammateForm = ({ onSuccess }: AddTeammateFormProps) => {
  const [formData, setFormData] = useState<AddTeammateRequest>({
    fullName: "",
    email: "",
    role: "",
    phone: "",
    department: "",
    location: "",
    avatar: ""
  });

  const addTeammateMutation = useAddTeammate();

  const roles = ["Developer", "Designer", "Manager", "Tester", "Analyst"];
  const departments = ["Engineering", "Design", "Management", "QA", "Business Analysis"];

  const handleInputChange = (field: keyof AddTeammateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate avatar from initials if not provided
    const avatarValue = formData.avatar || formData.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const teammateData = {
      ...formData,
      avatar: avatarValue
    };

    try {
      await addTeammateMutation.mutateAsync(teammateData);
      toast({
        title: "Success",
        description: "Teammate added successfully!",
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        role: "",
        phone: "",
        department: "",
        location: "",
        avatar: ""
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add teammate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add New Teammate</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Enter location"
              required
            />
          </div>

          <div>
            <Label htmlFor="avatar">Avatar (Optional)</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleInputChange("avatar", e.target.value)}
              placeholder="Enter initials or leave blank for auto-generation"
              maxLength={2}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave blank to auto-generate from name initials
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={addTeammateMutation.isPending}>
            {addTeammateMutation.isPending ? "Adding..." : "Add Teammate"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
