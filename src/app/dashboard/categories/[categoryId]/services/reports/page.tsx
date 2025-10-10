"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  discount: number;
  finalPrice: number;
  is_completed: boolean;
  appointment_count: number;
}

interface Appointment {
  id: string;
  service_id: string;
  customer_name: string;
  date: string;
  status: string;
  amount: number;
  is_paid: boolean;
}

interface RawCategory {
  id: number;
  name: string;
}

interface RawService {
  id: string;
  name: string;
  duration: string;
  price: number;
  discount?: number;
  is_completed: boolean;
  categories?: RawCategory[];
}

export default function ServiceReportsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = params.categoryId as string;
  const serviceId = searchParams.get("serviceId");

  const [category, setCategory] = useState<Category | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [reportServices, setReportServices] = useState<Service[]>([]);
  const [reportAppointments, setReportAppointments] = useState<Appointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category data
        const response = await fetch(`/api_g/categories/${categoryId}`);
        const categoryData = await response.json();
        setCategory(categoryData.category);

        // Fetch services data for this category using the working services endpoint
        const servicesResponse = await fetch(
          `/api_g/services?page=1&limit=100`
        );
        const servicesData = await servicesResponse.json();

        // Filter services by category
        const categoryServices = servicesData.data.filter(
          (service: RawService) =>
            service.categories &&
            service.categories.some(
              (cat: RawCategory) => cat.id.toString() === categoryId
            )
        );

        // Transform services to match expected format
        const transformedServices = categoryServices.map(
          (service: RawService) => ({
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
            discount: service.discount || 0,
            finalPrice:
              service.price - (service.price * (service.discount || 0)) / 100,
            is_completed: service.is_completed,
            appointment_count: 0, // We'll need to implement appointment fetching separately
          })
        );

        setReportServices(transformedServices);

        // For now, set empty appointments - we can implement this later
        setReportAppointments([]);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, serviceId]);

  let services = [...reportServices];

  // Apply price range filter
  if (minPrice) {
    services = services.filter(
      (s) => s.finalPrice >= Number.parseFloat(minPrice)
    );
  }
  if (maxPrice) {
    services = services.filter(
      (s) => s.finalPrice <= Number.parseFloat(maxPrice)
    );
  }

  // Apply duration filter
  if (durationFilter !== "all") {
    services = services.filter((s) => s.duration === durationFilter);
  }

  const handleDownloadReport = () => {
    // Create HTML content for PDF
    const reportDate = new Date().toLocaleDateString();
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #5b21b6; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: linear-gradient(to right, #3b82f6, #9333ea); color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background-color: #f9fafb; }
          .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #1f2937; }
          .status-completed { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
          .status-pending { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Services Report - ${category?.name}</h1>
          <div class="date">Generated on: ${reportDate}</div>
        </div>
        
        <div class="section-title">Services Summary</div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Discount (%)</th>
              <th>Price ($)</th>
              <th>Appointments</th>
            </tr>
          </thead>
          <tbody>
    `;

    services.forEach((service) => {
      const serviceAppointments = reportAppointments.filter(
        (apt) => apt.service_id === service.id
      );
      htmlContent += `
        <tr>
          <td>${service.name}</td>
          <td>${category?.name}</td>
          <td>${service.discount}%</td>
          <td>$${service.finalPrice.toFixed(2)}</td>
          <td>${serviceAppointments.length}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        
        <div class="section-title">Appointment Details</div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    services.forEach((service) => {
      const serviceAppointments = reportAppointments.filter(
        (apt) => apt.service_id === service.id
      );
      serviceAppointments.forEach((apt) => {
        const statusClass =
          apt.status === "completed" ? "status-completed" : "status-pending";
        htmlContent += `
          <tr>
            <td>${service.name}</td>
            <td>${apt.customer_name}</td>
            <td>${apt.date}</td>
            <td><span class="${statusClass}">${apt.status}</span></td>
          </tr>
        `;
      });
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create a new window and print to PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setDurationFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/categories/${categoryId}/services`)
              }
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Services
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Services Report - {category?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed report of services, pricing, and appointments
          </p>
        </div>

        <Button
          onClick={handleDownloadReport}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Range Filter */}
            <div className="space-y-2">
              <Label>Min Price ($)</Label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Price ($)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Duration Filter */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Durations</SelectItem>
                  <SelectItem value="30 min">30 minutes</SelectItem>
                  <SelectItem value="45 min">45 minutes</SelectItem>
                  <SelectItem value="60 min">60 minutes</SelectItem>
                  <SelectItem value="90 min">90 minutes</SelectItem>
                  <SelectItem value="120 min">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-blue-200 hover:bg-blue-50 bg-transparent"
            >
              Reset Filters
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {services.length} service(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Services Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Discount (%)</TableHead>
                <TableHead>Price ($)</TableHead>
                <TableHead>Appointments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{category?.name}</TableCell>
                  <TableCell>{service.discount}%</TableCell>
                  <TableCell>${service.finalPrice.toFixed(2)}</TableCell>
                  <TableCell>{service.appointment_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Appointments Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const serviceAppointments = reportAppointments.filter(
                  (apt) => apt.service_id === service.id
                );
                return serviceAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>{apt.customer_name}</TableCell>
                    <TableCell>{apt.date}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
