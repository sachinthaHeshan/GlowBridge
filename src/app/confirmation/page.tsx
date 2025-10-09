"use client";

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
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
  XCircle,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAppointmentById, type Appointment, ApiError } from "@/lib/appointmentApi";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import jsPDF from 'jspdf';

interface BookingDetails {
  id: string;
  service: string;
  salon: string;
  staff: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  address: string;
  phone: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export default function ConfirmationPage() {
  const { userData } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        console.log('Fetching booking with ID:', bookingId);
        const appointment = await fetchAppointmentById(bookingId);

        if (!appointment) {
          console.error('No appointment returned from API');
          setError('Booking not found');
          return;
        }

        // Log the full appointment data for debugging
        console.log('Raw appointment data:', JSON.stringify(appointment, null, 2));

        // Check for minimal required data
        if (!appointment.id || !appointment.start_at || !appointment.end_at || !appointment.amount) {
          console.error('Missing basic appointment data:', appointment);
          setError('Invalid booking data received - missing basic details');
          return;
        }

        // Log relations data for debugging
        console.log('Relations data:', {
          hasService: !!appointment.service,
          hasUser: !!appointment.user,
          serviceData: appointment.service,
          userData: appointment.user
        });
        
        const formattedBooking: BookingDetails = {
          id: appointment.id,
          service: appointment.service?.name ?? "Service Unavailable",
          salon: "GlowBridge Salon", // Default name until we add salon details to API
          staff: "Your Stylist", // Default name until we add staff details to API
          date: format(new Date(appointment.start_at), 'MMMM d, yyyy'),
          time: `${format(new Date(appointment.start_at), 'h:mm a')} - ${format(new Date(appointment.end_at), 'h:mm a')}`,
          duration: appointment.service?.duration ?? "Duration not specified",
          price: `Rs. ${appointment.amount.toFixed(2)}`,
          address: "123 Beauty Street", // Default address until we add salon details to API
          phone: "+94 11 234 5678", // Default phone until we add salon details to API
          customerName: appointment.user 
            ? `${appointment.user.first_name} ${appointment.user.last_name}`.trim()
            : "Customer",
          customerPhone: appointment.user?.contact_number ?? "Not provided",
          customerEmail: appointment.user?.email ?? "Not provided",
        };

        setBooking(formattedBooking);
      } catch (err) {
        console.error('Error in fetchBooking:', err);
        if (err instanceof ApiError) {
          setError(`Booking error: ${err.message}`);
        } else {
          setError(`Failed to fetch booking details: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-4">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Booking Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button variant="secondary">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your appointment has been successfully booked. We&apos;ve sent a
              confirmation to your email.
            </p>
          </div>
          {}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{booking.service}</CardTitle>
                  <CardDescription className="mt-1">
                    Booking ID: {booking.id}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Confirmed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/professional-female-hairstylist.png" />
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {booking.staff}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.salon}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {booking.address}
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.date}
                    </p>
                    <p className="text-sm text-muted-foreground">Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {booking.duration}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-foreground">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {booking.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Payment will be collected at the salon
                </p>
              </div>
            </CardContent>
          </Card>
          {}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Your Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>{booking.customerName}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {booking.customerPhone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      {booking.customerEmail}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Salon Contact
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>{booking.salon}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {booking.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {booking.address}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button 
              className="w-full bg-primary" 
              size="lg"
              onClick={() => {
                const pdf = new jsPDF();
                
                // Add logo or header
                pdf.setFontSize(20);
                pdf.setTextColor(44, 62, 80);
                pdf.text("GlowBridge Salon", 105, 20, { align: "center" });
                
                // Add appointment details
                pdf.setFontSize(16);
                pdf.text("Appointment Confirmation", 105, 40, { align: "center" });
                
                pdf.setFontSize(12);
                pdf.setTextColor(52, 73, 94);
                
                // Customer Details
                pdf.text("Customer Details", 20, 60);
                pdf.setFontSize(10);
                pdf.text(`Name: ${booking.customerName}`, 20, 70);
                pdf.text(`Email: ${booking.customerEmail}`, 20, 77);
                pdf.text(`Phone: ${booking.customerPhone}`, 20, 84);
                
                // Service Details
                pdf.setFontSize(12);
                pdf.text("Service Details", 20, 100);
                pdf.setFontSize(10);
                pdf.text(`Service: ${booking.service}`, 20, 110);
                pdf.text(`Date: ${booking.date}`, 20, 117);
                pdf.text(`Time: ${booking.time}`, 20, 124);
                pdf.text(`Duration: ${booking.duration}`, 20, 131);
                
                // Payment Details
                pdf.setFontSize(12);
                pdf.text("Payment Information", 20, 147);
                pdf.setFontSize(10);
                pdf.text(`Amount: ${booking.price}`, 20, 157);
                pdf.text("Payment Status: To be paid at salon", 20, 164);
                
                // Salon Details
                pdf.setFontSize(12);
                pdf.text("Salon Information", 20, 180);
                pdf.setFontSize(10);
                pdf.text(`Salon: ${booking.salon}`, 20, 190);
                pdf.text(`Address: ${booking.address}`, 20, 197);
                pdf.text(`Contact: ${booking.phone}`, 20, 204);
                
                // Footer
                pdf.setFontSize(8);
                pdf.setTextColor(127, 140, 141);
                pdf.text("Thank you for choosing GlowBridge Salon", 105, 280, { align: "center" });
                pdf.text(`Booking Reference: ${booking.id}`, 105, 285, { align: "center" });
                
                // Save the PDF
                pdf.save(`GlowBridge-Appointment-${booking.id}.pdf`);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>

            <Link href="/">
              <Button variant="ghost" className="w-full" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          {}
        </div>
      </div>
    </div>
  );
}
