"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, MapPin, Phone } from "lucide-react";
import { SalonType } from "@/constraint";
import {
  Salon as ApiSalon,
  createSalon,
  fetchSalons,
  updateSalon,
  deleteSalon,
} from "@/lib/salonApi";
import {
  showApiErrorToast,
  handleFormSubmissionWithToast,
} from "@/lib/errorToast";
import { Pagination } from "@/shared/components/pagination";
type Salon = ApiSalon;

export function SalonManagement() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: SalonType.SALON,
    bio: "",
    location: "",
    contact_number: "",
    status: "active" as "active" | "inactive",
  });


  const loadSalons = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const response = await fetchSalons(page, limit);
      setSalons(response.salons);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      showApiErrorToast(err, "Failed to load salons");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSalons();
  }, []);

  const handleAddSalon = () => {
    setEditingSalon(null);
    setFormData({
      name: "",
      type: SalonType.SALON,
      bio: "",
      location: "",
      contact_number: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditSalon = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      type: salon.type,
      bio: salon.bio,
      location: salon.location,
      contact_number: salon.contact_number,
      status: salon.status as "active" | "inactive",
    });
    setIsDialogOpen(true);
  };

  const handleSaveSalon = async () => {
    const result = await handleFormSubmissionWithToast(
      async () => {
        setSubmitting(true);

        if (editingSalon) {

          const updatedSalon = await updateSalon(editingSalon.id, formData);
          setSalons(
            salons.map((salon) =>
              salon.id === editingSalon.id ? updatedSalon : salon
            )
          );
          return updatedSalon;
        } else {

          const newSalon = await createSalon(formData);

          await loadSalons(pagination.page, pagination.limit);
          return newSalon;
        }
      },
      editingSalon ? "Updating salon..." : "Creating salon...",
      editingSalon
        ? "Salon updated successfully!"
        : "Salon created successfully!",
      editingSalon ? "Failed to update salon" : "Failed to create salon"
    );

    if (result) {
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  const handleDeleteSalon = async (id: string) => {
    await handleFormSubmissionWithToast(
      async () => {
        await deleteSalon(id);

        await loadSalons(pagination.page, pagination.limit);
        return true;
      },
      "Deleting salon...",
      "Salon deleted successfully!",
      "Failed to delete salon"
    );
  };

  return (
    <div className="space-y-6">
      {}
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

      {}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">
                Loading salons...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Salons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
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
              {salons.filter((salon) => salon.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Salons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {salons.filter((salon) => salon.status === "inactive").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>All Salons</CardTitle>
          <CardDescription>
            A list of all salon locations with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
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
                        {salon.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{salon.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {salon.contact_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        salon.status === "active" ? "default" : "secondary"
                      }
                      className={
                        salon.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {salon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {salon.created_at
                        ? new Date(salon.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </TableCell>
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

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => loadSalons(page, pagination.limit)}
            disabled={loading}
            itemLabel="salons"
          />
        </CardContent>
      </Card>

      {}
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
              <Label htmlFor="type">Salon Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: SalonType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salon type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SalonType.SALON}>Salon</SelectItem>
                  <SelectItem value={SalonType.BARBERSHOP}>
                    Barbershop
                  </SelectItem>
                  <SelectItem value={SalonType.BEAUTY_PARLOR}>
                    Beauty Parlor
                  </SelectItem>
                  <SelectItem value={SalonType.NAIL_SALON}>
                    Nail Salon
                  </SelectItem>
                  <SelectItem value={SalonType.HAIR_SALON}>
                    Hair Salon
                  </SelectItem>
                  <SelectItem value={SalonType.MAKEUP_SALON}>
                    Makeup Salon
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Description</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Enter salon description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter full address/location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) =>
                  setFormData({ ...formData, contact_number: e.target.value })
                }
                placeholder="Enter contact number"
              />
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSalon} disabled={submitting}>
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {submitting
                ? `${editingSalon ? "Updating" : "Creating"}...`
                : `${editingSalon ? "Update" : "Create"} Salon`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
