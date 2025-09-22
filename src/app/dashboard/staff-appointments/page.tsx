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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, CheckCircle, PlayCircle } from "lucide-react";

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
    {
      id: 2,
      customerName: "Michael Chen",
      customerAvatar: "/thoughtful-man.png",
      service: "Beard Trim",
      startTime: "11:00 AM",
      endTime: "11:30 AM",
      status: "In Progress",
      duration: "30m",
      staffMember: "James Rodriguez",
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
      id: 4,
      customerName: "David Wilson",
      customerAvatar: "/thoughtful-man.png",
      service: "Hair Wash & Style",
      startTime: "3:30 PM",
      endTime: "4:15 PM",
      status: "Confirmed",
      duration: "45m",
      staffMember: "James Rodriguez",
    },
    {
      id: 5,
      customerName: "Amanda Taylor",
      customerAvatar: "/diverse-woman-portrait.png",
      service: "Hair Cut",
      startTime: "4:30 PM",
      endTime: "5:15 PM",
      status: "Confirmed",
      duration: "45m",
      staffMember: "Maria Garcia",
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
    {
      id: 8,
      customerName: "Thomas Garcia",
      customerAvatar: "/thoughtful-man.png",
      service: "Hair Cut",
      startTime: "9:00 AM",
      endTime: "9:45 AM",
      status: "Completed",
      duration: "45m",
      staffMember: "James Rodriguez",
    },
    {
      id: 9,
      customerName: "Rachel Martinez",
      customerAvatar: "/diverse-woman-portrait.png",
      service: "Blowout",
      startTime: "Yesterday 4:00 PM",
      endTime: "Yesterday 5:00 PM",
      status: "Completed",
      duration: "1h",
      staffMember: "Maria Garcia",
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
                <span>Staff: {appointment.staffMember}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </Badge>
            <span className="text-xs text-gray-500">
              {appointment.duration}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("in-progress");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Appointments</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all staff appointments across the salon
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
            In Progress ({appointmentsData.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({appointmentsData.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Past ({appointmentsData.past.length})
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
                Currently active appointments across all staff members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointmentsData.inProgress.length > 0 ? (
                appointmentsData.inProgress.map((appointment) => (
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
                Scheduled appointments for today and upcoming days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointmentsData.upcoming.length > 0 ? (
                appointmentsData.upcoming.map((appointment) => (
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
              <CardDescription>Completed appointments history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointmentsData.past.length > 0 ? (
                appointmentsData.past.map((appointment) => (
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
