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
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  userCount: number;
}

export function SalonManagement() {
  const [salons, setSalons] = useState<Salon[]>([
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
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    status: "active" as "active" | "inactive",
  });

  const handleAddSalon = () => {
    setEditingSalon(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditSalon = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      address: salon.address,
      phone: salon.phone,
      email: salon.email,
      status: salon.status,
    });
    setIsDialogOpen(true);
  };

  const handleSaveSalon = () => {
    if (editingSalon) {
      setSalons(
        salons.map((salon) =>
          salon.id === editingSalon.id ? { ...salon, ...formData } : salon
        )
      );
    } else {
      const newSalon: Salon = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
      };
      setSalons([...salons, newSalon]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSalon = (id: string) => {
    setSalons(salons.filter((salon) => salon.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Salon Management
          </h1>
          <p className="text-muted-foreground">
            Manage all your salon locations and their details
          </p>
        </div>
        <Button
          onClick={handleAddSalon}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Salon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Salons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Salons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {salons.filter((s) => s.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salons.reduce((sum, salon) => sum + salon.userCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Salons</CardTitle>
          <CardDescription>
            A list of all salon locations with their details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{salon.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {salon.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {salon.phone}
                      </div>
                      <div className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {salon.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        salon.status === "active" ? "default" : "secondary"
                      }
                    >
                      {salon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{salon.userCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSalon(salon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSalon(salon.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSalon ? "Edit Salon" : "Add New Salon"}
            </DialogTitle>
            <DialogDescription>
              {editingSalon
                ? "Update the salon information below."
                : "Enter the details for the new salon location."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Salon Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter salon name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSalon}>
              {editingSalon ? "Update" : "Create"} Salon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
