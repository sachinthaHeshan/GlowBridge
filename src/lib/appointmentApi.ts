
export interface CreateAppointmentPayload {
  user_id: string;
  note: string;
  service_id: string;
  start_at: string;
  end_at: string;
  payment_type: "cash" | "card" | "online";
  amount: number;
}
export interface Service {
  id: string;
  salon_id: string;
  is_completed: boolean;
  name: string;
  description: string;
  duration: string;
  price: number;
  is_public: boolean;
  discount: number;
  categories: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}
export interface AppointmentUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
}
export interface AppointmentService {
  id: string;
  name: string;
  description: string;
  duration: string;
}
export interface Appointment {
  id: string;
  user_id: string;
  note: string;
  service_id: string;
  start_at: string;
  end_at: string;
  payment_type: string;
  amount: number;
  is_paid: boolean;
  status: "upcoming" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  user: AppointmentUser;
  service: AppointmentService;
}
export interface AllAppointmentsResponse {
  success: boolean;
  message: string;
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface ServiceResponse {
  success: boolean;
  message?: string;
  status?: number;
  data: Service;
}

interface AppointmentResponse {
  appointment: Appointment;
}

interface AppointmentsResponse {
  success: boolean;
  message: string;
  data: Appointment[];
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  // Always prefix with /api_g unless it already starts with it
  const url = endpoint.startsWith('/api_g') ? endpoint : `/api_g${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
};
export const fetchServiceById = async (serviceId: string): Promise<Service> => {
  try {
    console.log('Fetching service:', serviceId);
    const response = (await apiRequest(`/services/${serviceId}`)) as ServiceResponse;

    if (!response || !response.success) {
      console.error('Service API Error:', response);
      throw new ApiError(
        response?.message || "Failed to fetch service details",
        response?.status || 404
      );
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

export const fetchUserAppointments = async (userId: string): Promise<Appointment[]> => {
  try {
    console.log('Fetching appointments for user:', userId);
    const response = (await apiRequest(`/appointments/user/${userId}`)) as AppointmentsResponse;

    if (!response.success) {
      console.error('Failed to fetch appointments:', response);
      throw new ApiError("Failed to fetch user appointments", 400);
    }

    const appointments = response.data;
    console.log('Got appointments:', appointments.length);

    // Return early if no appointments
    if (!appointments || appointments.length === 0) {
      return [];
    }

    // Batch fetch all unique service IDs
    const uniqueServiceIds = [...new Set(
      appointments
        .filter(app => app.service_id && !app.service) // Only fetch for appointments without service data
        .map(app => app.service_id)
    )];

    console.log('Fetching services for IDs:', uniqueServiceIds);

    // Create service map
    const serviceMap = new Map<string, AppointmentService>();

    if (uniqueServiceIds.length > 0) {
      await Promise.all(
        uniqueServiceIds.map(async (serviceId) => {
          try {
            const service = await fetchServiceById(serviceId);
            if (service) {
              serviceMap.set(service.id, {
                id: service.id,
                name: service.name,
                description: service.description,
                duration: service.duration
              });
            }
          } catch (error) {
            console.error(`Failed to fetch service ${serviceId}:`, error);
          }
        })
      );
    }

    // Map appointments with services
    return appointments.map(appointment => ({
      ...appointment,
      service: appointment.service || serviceMap.get(appointment.service_id) || {
        id: appointment.service_id,
        name: 'Service Unavailable',
        description: '',
        duration: '30 min'
      }
    }));

  } catch (error) {
    console.error('Error in fetchUserAppointments:', error);
    throw error;
  }
};

export const createAppointment = async (
  appointmentData: CreateAppointmentPayload
): Promise<Appointment> => {
  try {
    const response = (await apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    })) as AppointmentResponse;

    return response.appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};
export const fetchAppointmentById = async (
  id: string
): Promise<Appointment> => {
  try {
    console.log(`Fetching appointment with ID: ${id}`);
    const response = await fetch(`/api_g/appointments/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log(`Response status:`, response.status);
    
    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const result = await response.json();
    console.log('API Response:', result);

    // Handle different response formats
    let appointment: Appointment | null = null;

    if (result.success && result.data) {
      // Format: { success: true, data: appointment }
      appointment = result.data;
    } else if (result.appointment) {
      // Format: { appointment }
      appointment = result.appointment;
    } else if (typeof result === 'object' && 'id' in result) {
      // Format: direct appointment object
      appointment = result;
    }

    if (!appointment) {
      console.error('Could not find appointment in response:', result);
      throw new ApiError("Invalid appointment data received", 404);
    }

    // Validate the appointment has required fields
    if (!appointment.id || !appointment.service_id) {
      console.error('Appointment missing required fields:', appointment);
      throw new ApiError("Invalid appointment data - missing required fields", 400);
    }

    return appointment;
  } catch (error) {
    console.error('Error in fetchAppointmentById:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to fetch appointment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};
export const updateAppointment = async (
  id: string,
  appointmentData: Partial<CreateAppointmentPayload>
): Promise<Appointment> => {
  const response = (await apiRequest(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
  })) as AppointmentResponse;

  return response.appointment;
};
export const cancelAppointment = async (
  id: string
): Promise<{ message: string }> => {
  return (await apiRequest(`/appointments/${id}`, {
    method: "DELETE",
  })) as { message: string };
};
export const updateAppointmentStatus = async (
  id: string,
  status: "upcoming" | "in_progress" | "completed"
): Promise<Appointment> => {

  const url = `/api_g/appointments/${id}/status`;

  const config: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new ApiError(
        result.message || "Failed to update appointment status",
        400
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
};
export const fetchAllAppointments = async (
  limit: number = 100,
  page: number = 1
): Promise<AllAppointmentsResponse> => {

  const url = `/api_g/appointments?limit=${limit}&page=${page}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      0
    );
  }
};
