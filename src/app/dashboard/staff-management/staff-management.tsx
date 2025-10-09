"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Loader2, Users } from "lucide-react";
import {
  fetchSalonStaff,
  createSalonStaff,
  updateSalonStaff,
  deleteUser,
  User,
} from "@/lib/userApi";
import { showApiErrorToast } from "@/lib/errorToast";
import { useAuth } from "@/contexts/AuthContext";

const StaffManagement = () => {
  const { userData } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          return "Full name is required";
        }
        if (value.trim().length < 2) {
          return "Full name must be at least 2 characters";
        }
        return "";

      case "email":
        if (!value.trim()) {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        return "";

      case "phone":
        if (!value.trim()) {
          return "Phone number is required";
        }
        const phoneRegex = /^[\d]{0,10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
          return "Please enter a valid phone number";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const errors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (touchedFields[fieldName as keyof typeof touchedFields]) {
      const error = validateField(fieldName, value);
      setValidationErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(
      fieldName,
      formData[fieldName as keyof typeof formData] as string
    );
    setValidationErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const loadStaff = useCallback(async () => {
    if (!userData?.salonId) {
      console.error("No salon ID found for the logged-in user");
      return;
    }

    setIsLoading(true);
    try {
      const staff = await fetchSalonStaff(userData.salonId);
      setStaffList(staff);
    } catch (error) {
      showApiErrorToast(error, "Failed to load staff");
    } finally {
      setIsLoading(false);
    }
  }, [userData?.salonId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staffList;
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [staffList, searchTerm]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
    });
    setValidationErrors({
      name: "",
      email: "",
      phone: "",
    });
    setTouchedFields({
      name: false,
      email: false,
      phone: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staff: User) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
    });
    setValidationErrors({
      name: "",
      email: "",
      phone: "",
    });
    setTouchedFields({
      name: false,
      email: false,
      phone: false,
    });
    setIsDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    const isValid = validateForm();

    if (!isValid) {
      setTouchedFields({
        name: true,
        email: true,
        phone: true,
      });
      return;
    }

    if (!userData?.salonId) {
      showApiErrorToast(
        new Error("No salon ID found"),
        "Unable to save staff member"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStaff) {
        await updateSalonStaff(editingStaff.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      } else {
        await createSalonStaff(userData.salonId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: "Test@12345",
        });
      }
      setIsDialogOpen(false);
      await loadStaff();
    } catch (error) {
      showApiErrorToast(
        error,
        editingStaff
          ? "Failed to update staff member"
          : "Failed to create staff member"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteUser(id);
      await loadStaff();
    } catch (error) {
      showApiErrorToast(error, "Failed to delete staff member");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const activeStaffCount = staffList.filter(
    (s) => s.status === "active"
  ).length;

  if (!userData?.salonId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You must be associated with a salon to manage staff.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Manage staff members for your salon
          </p>
        </div>
        <Button
          onClick={handleAddStaff}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{staffList.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {activeStaffCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {staffList.length - activeStaffCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Staff Members</CardTitle>
              <CardDescription>
                View and manage staff members in your salon
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <div className="text-muted-foreground">
                      Loading staff...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm
                        ? "No staff members found matching your search"
                        : "No staff members found. Add your first staff member to get started."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {staff.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{staff.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staff.status === "active" ? "default" : "secondary"
                        }
                      >
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(staff.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStaff(staff)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update the staff member information below."
                : "Add a new staff member to your salon."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                onBlur={() => handleFieldBlur("name")}
                placeholder="Enter full name"
                className={
                  validationErrors.name && touchedFields.name
                    ? "border-destructive"
                    : ""
                }
              />
              {validationErrors.name && touchedFields.name && (
                <p className="text-sm text-destructive">
                  {validationErrors.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={() => handleFieldBlur("email")}
                placeholder="Enter email address"
                className={
                  validationErrors.email && touchedFields.email
                    ? "border-destructive"
                    : ""
                }
              />
              {validationErrors.email && touchedFields.email && (
                <p className="text-sm text-destructive">
                  {validationErrors.email}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                onBlur={() => handleFieldBlur("phone")}
                placeholder="Enter phone number"
                className={
                  validationErrors.phone && touchedFields.phone
                    ? "border-destructive"
                    : ""
                }
              />
              {validationErrors.phone && touchedFields.phone && (
                <p className="text-sm text-destructive">
                  {validationErrors.phone}
                </p>
              )}
            </div>
            {!editingStaff && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> A default password (Test@12345) will be
                  assigned to the new staff member. They can change it after
                  their first login.
                </p>
              </div>
            )}
            {editingStaff && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Role cannot be changed. This user will
                  remain as staff member.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveStaff} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingStaff ? "Update" : "Create"} Staff Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
