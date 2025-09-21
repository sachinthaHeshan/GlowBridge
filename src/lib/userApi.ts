// User API functions for backend integration

import { UserRole } from "@/constraint";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3005";

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

// Map UserRole enum to backend API role (since backend expects specific strings)
const mapUserRoleToBackendRole = (userRole: UserRole): string => {
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
  const url = `${BACKEND_URL}/api${endpoint}`;

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
  let endpoint = `/users?page=${page}&limit=${limit}`;
  if (role && role !== "all") {
    endpoint += `&role=${role}`;
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

// Create new user
export const createUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive";
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
