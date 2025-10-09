"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Phone,
  Mail,
  ArrowLeft,
  Scissors,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserAppointments, cancelAppointment } from "@/lib/appointmentApi";
import type { Appointment } from "@/lib/appointmentApi";
import { toast } from "react-hot-toast";

interface AppointmentDetails {
  id: string;
  service_id: string;
  service: string;
  salon: string;
  staff: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  status: string;
  location: string;
}

const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export default function DashboardPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentDetails[]>([]);
  const [pastAppointments, setPastAppointments] = useState<AppointmentDetails[]>([]);

  const handleReschedule = (service_id: string) => {
    router.push(`/services/${service_id}`);
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      
      // Update the appointments list by removing the cancelled appointment
      setUpcomingAppointments(prev => 
        prev.filter(appointment => appointment.id !== appointmentId)
      );
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const transformAppointment = (appointment: Appointment): AppointmentDetails => {
    const startDate = new Date(appointment.start_at);
    const endDate = new Date(appointment.end_at);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    let serviceName = 'Loading...';
    let serviceDuration = `${durationMinutes} min`;

    if (appointment.service) {
      serviceName = appointment.service.name;
      serviceDuration = appointment.service.duration || serviceDuration;
    } else if (!appointment.service && appointment.service_id) {
      // Service data is missing but we have the ID
      console.warn(`Service data missing for appointment ${appointment.id}, service_id: ${appointment.service_id}`);
      serviceName = 'Loading service details...';
    } else {
      console.error('Missing service data for appointment:', appointment.id);
      serviceName = 'Service Unavailable';
    }
    
    return {
      id: appointment.id,
      service: serviceName,
      service_id: appointment.service_id,
      salon: "GlowBridge Salon",
      staff: "Your Stylist", // Will be updated when staff information is added to the API
      date: format(startDate, 'MMMM d, yyyy'),
      time: format(startDate, 'h:mm a'),
      duration: serviceDuration,
      price: `Rs. ${appointment.amount.toFixed(2)}`,
      status: appointment.status,
      location: "Colombo 03"
    };
  };

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return;
    }

    // If auth is done loading and we don't have user data, redirect to login
    if (!authLoading && !userData?.id) {
      router.push('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const appointments = await fetchUserAppointments(userData!.id);
        
        // Debug log to see the full response
        console.log('Raw appointments data:', JSON.stringify(appointments, null, 2));
        
        if (!appointments || !Array.isArray(appointments)) {
          console.error('Invalid appointments data:', appointments);
          setError('Failed to load appointments data');
          setLoading(false);
          return;
        }

        const now = new Date();
        const upcoming = [];
        const past = [];

        // Transform and sort appointments
        const transformed = appointments.map(appointment => ({
          date: new Date(appointment.start_at),
          data: transformAppointment(appointment)
        }));

        // Sort by date and split into upcoming and past
        const { upcomingAppts, pastAppts } = transformed.reduce((acc, item) => {
          if (item.date > now) {
            acc.upcomingAppts.push(item.data);
          } else {
            acc.pastAppts.push(item.data);
          }
          return acc;
        }, { 
          upcomingAppts: [] as AppointmentDetails[], 
          pastAppts: [] as AppointmentDetails[] 
        });

        // Sort appointments by date
        upcomingAppts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        pastAppts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setUpcomingAppointments(upcomingAppts);
        setPastAppointments(pastAppts);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load your appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Loader2 className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Get user info from userData
  const userName = userData?.name || 'User';
  const userEmail = userData?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  My Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{userName}</CardTitle>
                <CardDescription>BeautyBook Member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{userEmail}</span>
                </div>
                {userData?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{userData.phone}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/">
                  <Button className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Book New Appointment
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="lg:col-span-3 space-y-8">
            {}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Upcoming Appointments
                </h2>
                <Badge variant="secondary">
                  {upcomingAppointments.length} scheduled
                </Badge>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-primary"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {appointment.service}
                              </h3>
                              <p className="text-muted-foreground">
                                {appointment.salon}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {appointment.time} ({appointment.duration})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src="/professional-female-hairstylist.png" />
                                <AvatarFallback>
                                  {appointment.staff
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {appointment.staff}
                              </span>
                            </div>
                          </div>

                          <div className="text-right space-y-2">
                            <div className="text-lg font-semibold text-primary">
                              {appointment.price}
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {appointment.status}
                            </Badge>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent"
                                onClick={() => handleReschedule(appointment.service_id)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to cancel this appointment?')) {
                                    handleCancel(appointment.id);
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No upcoming appointments
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Book your next beauty appointment today!
                    </p>
                    <Link href="/">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Past Appointments
                </h2>
                <Badge variant="outline">
                  {pastAppointments.length} completed
                </Badge>
              </div>

              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {appointment.service}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {appointment.salon}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {appointment.staff
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{appointment.staff}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <div className="text-sm font-medium">
                            {appointment.price}
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-600"
                          >
                            {appointment.status}
                          </Badge>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                            >
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
