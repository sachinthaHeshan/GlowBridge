"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, User, Edit, Save, X } from "lucide-react";

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface Staff {
  id: number;
  name: string;
  avatar: string;
  role: string;
  salon: string;
  schedule: Record<DayOfWeek, DaySchedule>;
  totalHours: number;
  status: string;
}

// Dummy data for staff working hours
const staffWorkingHours = [
  {
    id: 1,
    name: "Emma Wilson",
    avatar: "/professional-woman.png",
    role: "Senior Stylist",
    salon: "Downtown Salon",
    schedule: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: true, start: "10:00", end: "16:00" },
      sunday: { enabled: false, start: "09:00", end: "17:00" },
    },
    totalHours: 46,
    status: "Active",
  },
  {
    id: 2,
    name: "James Rodriguez",
    avatar: "/man-professional.jpg",
    role: "Barber",
    salon: "Downtown Salon",
    schedule: {
      monday: { enabled: true, start: "10:00", end: "18:00" },
      tuesday: { enabled: true, start: "10:00", end: "18:00" },
      wednesday: { enabled: false, start: "10:00", end: "18:00" },
      thursday: { enabled: true, start: "10:00", end: "18:00" },
      friday: { enabled: true, start: "10:00", end: "18:00" },
      saturday: { enabled: true, start: "09:00", end: "17:00" },
      sunday: { enabled: true, start: "11:00", end: "15:00" },
    },
    totalHours: 44,
    status: "Active",
  },
  {
    id: 3,
    name: "Lisa Thompson",
    avatar: "/woman-therapist.jpg",
    role: "Esthetician",
    salon: "Spa & Wellness",
    schedule: {
      monday: { enabled: true, start: "08:00", end: "16:00" },
      tuesday: { enabled: true, start: "08:00", end: "16:00" },
      wednesday: { enabled: true, start: "08:00", end: "16:00" },
      thursday: { enabled: true, start: "08:00", end: "16:00" },
      friday: { enabled: true, start: "08:00", end: "16:00" },
      saturday: { enabled: false, start: "08:00", end: "16:00" },
      sunday: { enabled: false, start: "08:00", end: "16:00" },
    },
    totalHours: 40,
    status: "Active",
  },
  {
    id: 4,
    name: "Sophie Chen",
    avatar: "/woman-asian-professional.jpg",
    role: "Nail Technician",
    salon: "Beauty Lounge",
    schedule: {
      monday: { enabled: true, start: "09:30", end: "17:30" },
      tuesday: { enabled: true, start: "09:30", end: "17:30" },
      wednesday: { enabled: true, start: "09:30", end: "17:30" },
      thursday: { enabled: true, start: "09:30", end: "17:30" },
      friday: { enabled: true, start: "09:30", end: "17:30" },
      saturday: { enabled: true, start: "10:00", end: "18:00" },
      sunday: { enabled: false, start: "09:30", end: "17:30" },
    },
    totalHours: 48,
    status: "Active",
  },
];

const daysOfWeek: Array<{ key: DayOfWeek; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function StaffScheduleCard({ staff }: { staff: Staff }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(staff.schedule);

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving schedule for", staff.name, editedSchedule);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSchedule(staff.schedule);
    setIsEditing(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    setEditedSchedule({
      ...editedSchedule,
      [day]: {
        ...editedSchedule[day],
        enabled: !editedSchedule[day].enabled,
      },
    });
  };

  const updateTime = (
    day: DayOfWeek,
    timeType: "start" | "end",
    value: string
  ) => {
    setEditedSchedule({
      ...editedSchedule,
      [day]: {
        ...editedSchedule[day],
        [timeType]: value,
      },
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={staff.avatar || "/placeholder.svg"}
                alt={staff.name}
              />
              <AvatarFallback>
                {staff.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{staff.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{staff.role}</span>
                <span>•</span>
                <span>{staff.salon}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {staff.totalHours}h/week
            </Badge>
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const daySchedule = isEditing
              ? editedSchedule[day.key]
              : staff.schedule[day.key];
            return (
              <div
                key={day.key}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <Switch
                      checked={daySchedule.enabled}
                      onCheckedChange={() => toggleDay(day.key)}
                    />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${
                        daySchedule.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                  <Label className="font-medium text-gray-900 w-20">
                    {day.label}
                  </Label>
                </div>

                {daySchedule.enabled ? (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          type="time"
                          value={daySchedule.start}
                          onChange={(e) =>
                            updateTime(day.key, "start", e.target.value)
                          }
                          className="w-24 h-8"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={daySchedule.end}
                          onChange={(e) =>
                            updateTime(day.key, "end", e.target.value)
                          }
                          className="w-24 h-8"
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>
                          {daySchedule.start} - {daySchedule.end}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600"
                  >
                    Day Off
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkingHoursPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Working Hours
          </h1>
          <p className="text-gray-600 mt-2">
            Manage working days and hours for all staff members
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <User className="h-4 w-4 mr-2" />
          Add New Staff
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {staffWorkingHours.length}
            </div>
            <p className="text-xs text-blue-600">Active members</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Average Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {Math.round(
                staffWorkingHours.reduce(
                  (acc, staff) => acc + staff.totalHours,
                  0
                ) / staffWorkingHours.length
              )}
              h
            </div>
            <p className="text-xs text-green-600">Per week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {staffWorkingHours.reduce(
                (acc, staff) => acc + staff.totalHours,
                0
              )}
              h
            </div>
            <p className="text-xs text-purple-600">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Schedule Cards */}
      <div className="space-y-6">
        {staffWorkingHours.map((staff) => (
          <StaffScheduleCard key={staff.id} staff={staff} />
        ))}
      </div>
    </div>
  );
}
