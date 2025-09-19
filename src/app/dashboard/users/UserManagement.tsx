"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Edit, Trash2, Mail, Phone, ArrowLeft } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "stylist" | "receptionist";
  status: "active" | "inactive";
  joinDate: string;
  salonId: string;
}

export function UserManagement() {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "stylist" as "admin" | "stylist" | "receptionist",
    status: "active" as "active" | "inactive",
  });

  // Mock data
  const salons: Salon[] = [
    {
      id: "1",
      name: "Glamour Studio",
      address: "123 Beauty Ave, New York, NY 10001",
      phone: "+1 (555) 123-4567",
      email: "info@glamourstudio.com",
      status: "active",
      userCount: 12,
    },
    {
      id: "2",
      name: "Elite Hair Lounge",
      address: "456 Style St, Los Angeles, CA 90210",
      phone: "+1 (555) 987-6543",
      email: "contact@elitehair.com",
      status: "active",
      userCount: 8,
    },
    {
      id: "3",
      name: "Serenity Spa",
      address: "789 Wellness Way, Miami, FL 33101",
      phone: "+1 (555) 456-7890",
      email: "hello@serenityspa.com",
      status: "inactive",
      userCount: 5,
    },
  ];

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@glamourstudio.com",
      phone: "+1 (555) 111-2222",
      role: "admin",
      status: "active",
      joinDate: "2024-01-15",
      salonId: "1",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@glamourstudio.com",
      phone: "+1 (555) 333-4444",
      role: "stylist",
      status: "active",
      joinDate: "2024-02-20",
      salonId: "1",
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@glamourstudio.com",
      phone: "+1 (555) 555-6666",
      role: "receptionist",
      status: "active",
      joinDate: "2024-03-10",
      salonId: "1",
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      email: "alex@elitehair.com",
      phone: "+1 (555) 777-8888",
      role: "admin",
      status: "active",
      joinDate: "2024-01-05",
      salonId: "2",
    },
    {
      id: "5",
      name: "Lisa Wang",
      email: "lisa@elitehair.com",
      phone: "+1 (555) 999-0000",
      role: "stylist",
      status: "inactive",
      joinDate: "2024-02-15",
      salonId: "2",
    },
  ]);

  const filteredUsers = selectedSalon
    ? users.filter((user) => user.salonId === selectedSalon.id)
    : [];

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
  };

  const handleBackToSalons = () => {
    setSelectedSalon(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "stylist",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...formData } : user
        )
      );
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        joinDate: new Date().toISOString().split("T")[0],
        salonId: selectedSalon!.id,
      };
      setUsers([...users, newUser]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "stylist":
        return "secondary";
      case "receptionist":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Salon selection view
  if (!selectedSalon) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Select a salon to manage its users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Card
              key={salon.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSalonSelect(salon)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{salon.name}</CardTitle>
                  <Badge
                    variant={
                      salon.status === "active" ? "default" : "secondary"
                    }
                  >
                    {salon.status}
                  </Badge>
                </div>
                <CardDescription>{salon.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {salon.phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {salon.email}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      Users:
                    </span>
                    <span className="font-semibold">{salon.userCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // User management view for selected salon
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToSalons}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Salons
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedSalon.name}
            </h1>
            <p className="text-muted-foreground">
              Manage users for this salon location
            </p>
          </div>
        </div>
        <Button
          onClick={handleAddUser}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {filteredUsers.filter((u) => u.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stylists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.filter((u) => u.role === "stylist").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.filter((u) => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            All users associated with {selectedSalon.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {/* User icon */}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.joinDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update the user information below."
                : `Add a new user to ${selectedSalon.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "stylist" | "receptionist") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="stylist">Stylist</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? "Update" : "Create"} User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
