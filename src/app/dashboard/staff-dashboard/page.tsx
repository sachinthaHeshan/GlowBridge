"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  Eye,
  Square,
  Play,
} from "lucide-react";

interface Appointment {
  id: number;
  customerName: string;
  customerAvatar: string;
  service: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: string;
  staffMember: string;
}

const currentStaff = "Emma Wilson";

const appointmentsData = {
  inProgress: [
    {
      id: 1,
      customerName: "Sarah Johnson",
      customerAvatar: "/diverse-woman-portrait.png",
      service: "Hair Cut & Color",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      status: "In Progress",
      duration: "1h 30m",
      staffMember: "Emma Wilson",
    },
  ],
  upcoming: [
    {
      id: 3,
      customerName: "Lisa Anderson",
      customerAvatar: "/diverse-woman-portrait.png",
      service: "Highlights",
      startTime: "2:00 PM",
      endTime: "4:00 PM",
      status: "Confirmed",
      duration: "2h",
      staffMember: "Emma Wilson",
    },
    {
      id: 6,
      customerName: "Robert Brown",
      customerAvatar: "/thoughtful-man.png",
      service: "Full Service",
      startTime: "5:00 PM",
      endTime: "6:30 PM",
      status: "Confirmed",
      duration: "1h 30m",
      staffMember: "Emma Wilson",
    },
  ],
  past: [
    {
      id: 7,
      customerName: "Jennifer Lee",
      customerAvatar: "/diverse-woman-portrait.png",
      service: "Hair Color",
      startTime: "8:00 AM",
      endTime: "10:00 AM",
      status: "Completed",
      duration: "2h",
      staffMember: "Emma Wilson",
    },
  ],
};

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <PlayCircle className="h-4 w-4" />;
      case "Confirmed":
        return <Calendar className="h-4 w-4" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const renderActionButtons = (status: string) => {
    switch (status) {
      case "In Progress":
        return (
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        );
      case "Confirmed":
        return (
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Square className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        );
      case "Completed":
        return (
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={appointment.customerAvatar || "/placeholder.svg"}
                alt={appointment.customerName}
              />
              <AvatarFallback>
                {appointment.customerName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">
                {appointment.customerName}
              </h3>
              <p className="text-sm text-gray-600">{appointment.service}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {appointment.startTime} - {appointment.endTime}
                </div>
                <span>{appointment.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </Badge>
          </div>
        </div>
        {renderActionButtons(appointment.status)}
      </CardContent>
    </Card>
  );
}

export default function StaffDashboardPage() {
  const [activeTab, setActiveTab] = useState("in-progress");

  const filteredAppointments = {
    inProgress: appointmentsData.inProgress.filter(
      (apt) => apt.staffMember === currentStaff
    ),
    upcoming: appointmentsData.upcoming.filter(
      (apt) => apt.staffMember === currentStaff
    ),
    past: appointmentsData.past.filter(
      (apt) => apt.staffMember === currentStaff
    ),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {currentStaff}! Manage your appointments for today.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            In Progress ({filteredAppointments.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({filteredAppointments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Past ({filteredAppointments.past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                In Progress Appointments
              </CardTitle>
              <CardDescription>
                Your currently active appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAppointments.inProgress.length > 0 ? (
                filteredAppointments.inProgress.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No appointments in progress
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Your scheduled appointments for today and upcoming days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAppointments.upcoming.length > 0 ? (
                filteredAppointments.upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                Past Appointments
              </CardTitle>
              <CardDescription>
                Your completed appointments history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAppointments.past.length > 0 ? (
                filteredAppointments.past.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No past appointments
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
