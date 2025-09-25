// User API functions for backend integration

import { UserRole } from "@/constraint";

// Backend user structure (reflects actual API response)
interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string; // Backend API returns "admin" | "customer" | "salon_owner" | "salon_staff"
}

// Frontend user structure (matching component interface)
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
  joinDate: string;
  salonId: string;
}

// Create user payload for backend
interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string; // Send backend-compatible role string ("admin" | "customer" | "salon_owner" | "salon_staff")
  password?: string; // Optional password field
}

// Update user payload for backend
interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  contact_number?: string;
  role?: string; // Send backend-compatible role string ("admin" | "customer" | "salon_owner" | "salon_staff")
}

// API Response types
interface UsersResponse {
  users: BackendUser[];
}

interface PaginatedUsersResponse {
  data: BackendUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserResponse {
  user: BackendUser;
}

interface DeleteResponse {
  message: string;
}

// Staff Availability interfaces
export interface StaffAvailabilityItem {
  id: string;
  salon_staff_id: string;
  day_of_week: number; // 1-7 (Monday to Sunday)
  start_time: string; // "HH:MM:SS" format
  end_time: string; // "HH:MM:SS" format
  is_available: boolean;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  salon_name: string;
}

interface StaffAvailabilityResponse {
  data: StaffAvailabilityItem[];
  message: string;
}

// Update staff availability payload
interface UpdateStaffAvailabilityPayload {
  day_of_week: number;
  start_time: string; // "HH:MM" format
  end_time: string; // "HH:MM" format
  is_available: boolean;
}

interface UpdateStaffAvailabilityResponse {
  message: string;
}

// Map UserRole enum or string to backend API role (since backend expects specific strings)
const mapUserRoleToBackendRole = (userRole: UserRole | string): string => {
  // Handle string inputs (like "CUSTOMER", "ADMIN", etc.)
  if (typeof userRole === "string") {
    const roleString = userRole.toLowerCase();
    switch (roleString) {
      case "admin":
        return "admin";
      case "staff":
      case "salon_staff":
        return "salon_staff";
      case "salon_owner":
        return "salon_owner";
      case "customer":
      default:
        return "customer";
    }
  }

  // Handle UserRole enum inputs
  switch (userRole) {
    case UserRole.ADMIN:
      return "admin";
    case UserRole.STAFF:
      return "salon_staff";
    case UserRole.SALON_OWNER:
      return "salon_owner";
    case UserRole.CUSTOMER:
    default:
      return "customer";
  }
};

// Map backend API role to UserRole enum
const mapBackendRoleToUserRole = (backendRole: string): UserRole => {
  switch (backendRole) {
    case "admin":
      return UserRole.ADMIN;
    case "salon_staff":
      return UserRole.STAFF;
    case "salon_owner":
      return UserRole.SALON_OWNER;
    case "customer":
    default:
      return UserRole.CUSTOMER;
  }
};

// Transform backend user to frontend user
const transformBackendUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    name: `${backendUser.first_name} ${backendUser.last_name}`.trim(),
    email: backendUser.email,
    phone: backendUser.contact_number,
    role: mapBackendRoleToUserRole(backendUser.role),
    status: "active", // Default to active since backend doesn't have status
    joinDate: new Date().toISOString().split("T")[0], // Default to today since backend doesn't have joinDate
    salonId: "1", // Default salon ID since backend doesn't have salonId relationship yet
  };
};

// API Error class
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

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const url = `/api_g${endpoint}`;

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

// Paginated users result
export interface PaginatedUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fetch all users with pagination and filtering
export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  role?: string
): Promise<PaginatedUsersResult> => {
  let endpoint = `/users?page=${String(page)}&limit=${String(limit)}`;
  if (role && role !== "all") {
    endpoint += `&role=${encodeURIComponent(role)}`;
  }

  const response = (await apiRequest(endpoint)) as PaginatedUsersResponse;
  return {
    users: response.data.map(transformBackendUser),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch users for a specific salon
export const fetchSalonUsers = async (salonId: string): Promise<User[]> => {
  const response = (await apiRequest(
    `/salon/${salonId}/user`
  )) as UsersResponse;
  return response.users.map((user) => ({
    ...transformBackendUser(user),
    salonId: salonId, // Ensure salonId is set for frontend state
  }));
};

// Fetch user by ID
export const fetchUserById = async (id: string): Promise<User> => {
  const response = (await apiRequest(`/users/${id}`)) as UserResponse;
  return transformBackendUser(response.user);
};

// Fetch user by email
export const fetchUserByEmail = async (email: string): Promise<User> => {
  try {
    console.log(`Searching for user with email: ${email}`);

    // First, try to see if backend supports email filtering (undocumented feature)
    try {
      const directResponse = await apiRequest(
        `/users?page=1&limit=1&email=${encodeURIComponent(email)}`
      );
      console.log("Trying direct email search...", directResponse);

      const response = directResponse as PaginatedUsersResponse;
      if (response.data && response.data.length > 0) {
        const user = response.data.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          console.log(
            `Found user via direct search: ${user.first_name} ${user.last_name}`
          );
          return transformBackendUser(user);
        }
      }
    } catch (directError) {
      console.log(
        "Direct email search failed, falling back to pagination:",
        directError
      );
    }

    // Fallback: Use fetchUsers with pagination to get all users, then filter by email
    let page = 1;
    const limit = 100; // Fetch more users per page to reduce API calls

    while (true) {
      console.log(`Fetching users page ${page} with limit ${limit}`);
      const result = await fetchUsers(page, limit);
      console.log(
        `Found ${result.users.length} users on page ${page}/${result.totalPages}`
      );

      const userWithEmail = result.users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (userWithEmail) {
        console.log(
          `Found user: ${userWithEmail.name} (${userWithEmail.email})`
        );
        return userWithEmail;
      }

      // If we've checked all pages and no more users exist, user not found
      if (page >= result.totalPages || result.users.length === 0) {
        break;
      }

      page++;
    }

    console.log(`User with email ${email} not found after checking all pages`);
    throw new ApiError(`User with email ${email} not found`, 404);
  } catch (error) {
    console.error(`Error in fetchUserByEmail:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to fetch user by email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
};

// Fetch user by Firebase UID
export const fetchUserByFirebaseUID = async (
  firebaseUid: string
): Promise<User> => {
  const response = await apiRequest(`/users/firebase/${firebaseUid}`);
  console.log(1111, response);
  // Handle the response format from your API: {"success":true,"message":"User retrieved successfully","data":{...}}
  const apiResponse = response as {
    success: boolean;
    message: string;
    data: BackendUser;
  };

  if (!apiResponse.success || !apiResponse.data) {
    throw new ApiError(
      apiResponse.message || `User with Firebase UID ${firebaseUid} not found`,
      404
    );
  }

  return transformBackendUser(apiResponse.data);
};

// Create new user (backend handles both Firebase and database user creation)
export const createUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  role: UserRole | string;
  status: "active" | "inactive";
  password?: string;
}): Promise<User> => {
  // Split name into first and last name
  const nameParts = userData.name.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const payload: CreateUserPayload = {
    first_name: firstName,
    last_name: lastName,
    email: userData.email,
    contact_number: userData.phone,
    role: mapUserRoleToBackendRole(userData.role),
  };

  // Add password if provided - backend will handle Firebase user creation
  if (userData.password) {
    payload.password = userData.password;
  }

  try {
    const response = (await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    })) as UserResponse;

    return transformBackendUser(response.user);
  } catch (error) {
    // Handle backend API errors and convert them to user-friendly messages
    if (error instanceof ApiError) {
      let errorMessage = error.message;

      // Convert backend error messages to user-friendly ones
      if (
        error.message.includes("Email already exists") ||
        error.message.includes("already exists in Firebase")
      ) {
        errorMessage = "An account with this email already exists";
      } else if (
        error.message.includes("weak password") ||
        error.message.includes("password")
      ) {
        errorMessage = "Password is too weak. Please use at least 6 characters";
      } else if (
        error.message.includes("invalid email") ||
        error.message.includes("email")
      ) {
        errorMessage = "Please enter a valid email address";
      }

      throw new ApiError(errorMessage, error.status, error.response);
    }

    throw error;
  }
};

// Create user with raw backend format (direct API format)
export const createUserDirect = async (userData: {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
  password?: string;
}): Promise<User> => {
  const payload: CreateUserPayload = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    contact_number: userData.contact_number,
    role: mapUserRoleToBackendRole(userData.role),
  };

  // Add password if provided
  if (userData.password) {
    payload.password = userData.password;
  }

  const response = (await apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as UserResponse;

  return transformBackendUser(response.user);
};

// Update user
export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    status?: "active" | "inactive";
  }
): Promise<User> => {
  const payload: UpdateUserPayload = {};

  // Handle name update
  if (userData.name) {
    const nameParts = userData.name.trim().split(" ");
    payload.first_name = nameParts[0] || "";
    payload.last_name = nameParts.slice(1).join(" ") || "";
  }

  // Handle other fields
  if (userData.email) payload.email = userData.email;
  if (userData.phone) payload.contact_number = userData.phone;
  if (userData.role) payload.role = mapUserRoleToBackendRole(userData.role);

  const response = (await apiRequest(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as UserResponse;

  return transformBackendUser(response.user);
};

// Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  return (await apiRequest(`/users/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;
};

// Fetch staff availability
export const fetchStaffAvailability = async (): Promise<
  StaffAvailabilityItem[]
> => {
  const response = (await apiRequest(
    "/staff-availability"
  )) as StaffAvailabilityResponse;
  return response.data;
};

// Update staff availability
export const updateStaffAvailability = async (
  availabilityId: string,
  updateData: UpdateStaffAvailabilityPayload
): Promise<{ message: string }> => {
  // Send payload directly - API expects HH:MM format
  const response = (await apiRequest(`/staff-availability/${availabilityId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  })) as UpdateStaffAvailabilityResponse;

  return response;
};
