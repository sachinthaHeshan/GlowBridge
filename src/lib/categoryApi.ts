// Category and Service API functions for backend integration

// Backend category structure (reflects actual API response)
interface BackendCategory {
  id: number;
  name: string;
  description: string;
}

// Backend service structure (reflects actual API response)
interface BackendService {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  is_public: boolean;
  discount: number;
  is_completed: boolean;
  categories: BackendCategory[];
}

// Frontend category structure (matching component interface)
export interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

// Frontend service structure (matching component interface)
export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  is_public: boolean;
  discount: number;
  is_completed: boolean;
  categories: Category[];
}

// Create category payload for backend
interface CreateCategoryPayload {
  name: string;
  description?: string;
  is_active?: boolean;
}

// Update category payload for backend
interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Create service payload for backend
interface CreateServicePayload {
  salon_id: string;
  name: string;
  description: string;
  duration: string;
  price?: number;
  is_public: boolean;
  discount?: number;
  is_completed?: boolean;
  category_ids: number[];
}

// Update service payload for backend
interface UpdateServicePayload {
  salon_id?: string;
  name?: string;
  description?: string;
  duration?: string;
  price?: number;
  is_public?: boolean;
  discount?: number;
  is_completed?: boolean;
  category_ids?: number[];
}

// API Response types
interface CategoriesResponse {
  data: BackendCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CategoryResponse {
  success: boolean;
  category: BackendCategory;
}

interface ServicesResponse {
  data: BackendService[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ServiceResponse {
  success: boolean;
  service: BackendService;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// Transform backend category to frontend category
const transformBackendCategory = (
  backendCategory: BackendCategory
): Category => {
  return {
    id: backendCategory.id.toString(), // Convert number to string
    name: backendCategory.name,
    description: backendCategory.description,
    is_active: true, // Default to active since not provided by backend
  };
};

// Transform backend service to frontend service
const transformBackendService = (backendService: BackendService): Service => {
  return {
    id: backendService.id,
    salon_id: backendService.salon_id,
    name: backendService.name,
    description: backendService.description,
    duration: backendService.duration,
    price: backendService.price,
    is_public: backendService.is_public,
    discount: backendService.discount,
    is_completed: backendService.is_completed,
    categories: backendService.categories.map((cat) =>
      transformBackendCategory(cat)
    ),
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
        errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`,
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

// Paginated categories result
export interface PaginatedCategoriesResult {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Paginated services result
export interface PaginatedServicesResult {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== CATEGORY API FUNCTIONS ==========

// Fetch all categories with pagination and filtering
export const fetchCategories = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  is_active?: boolean
): Promise<PaginatedCategoriesResult> => {
  let endpoint = `/categories?page=${page}&limit=${limit}`;

  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  if (is_active !== undefined) endpoint += `&is_active=${is_active}`;

  const response = (await apiRequest(endpoint)) as CategoriesResponse;

  // For now, we'll set serviceCount to 0
  // This can be fetched separately or enhanced later
  return {
    categories: response.data.map((cat) => transformBackendCategory(cat)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch active categories only
export const fetchActiveCategories = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedCategoriesResult> => {
  const response = (await apiRequest(
    `/categories/active?page=${page}&limit=${limit}`
  )) as CategoriesResponse;

  return {
    categories: response.data.map((cat) => transformBackendCategory(cat)),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch category by ID
export const fetchCategoryById = async (id: string): Promise<Category> => {
  const response = (await apiRequest(`/categories/${id}`)) as CategoryResponse;
  return transformBackendCategory(response.category);
};

// Find category by name
export const findCategoryByName = async (name: string): Promise<Category> => {
  const response = (await apiRequest(
    `/categories/name/${encodeURIComponent(name)}`
  )) as { success: boolean; data: BackendCategory };
  return transformBackendCategory(response.data);
};

// Create new category
export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  is_active?: boolean;
}): Promise<Category> => {
  const payload: CreateCategoryPayload = {
    name: categoryData.name,
    description: categoryData.description,
    is_active: categoryData.is_active ?? true,
  };

  const response = (await apiRequest("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as CategoryResponse;

  return transformBackendCategory(response.category);
};

// Update category
export const updateCategory = async (
  id: string,
  categoryData: {
    name?: string;
    description?: string;
    is_active?: boolean;
  }
): Promise<Category> => {
  const payload: UpdateCategoryPayload = {};

  if (categoryData.name !== undefined) payload.name = categoryData.name;
  if (categoryData.description !== undefined)
    payload.description = categoryData.description;
  if (categoryData.is_active !== undefined)
    payload.is_active = categoryData.is_active;

  const response = (await apiRequest(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as CategoryResponse;

  return transformBackendCategory(response.category);
};

// Delete category
export const deleteCategory = async (
  id: string
): Promise<{ message: string }> => {
  const response = (await apiRequest(`/categories/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;

  return { message: response.message };
};

// Toggle category status
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  const response = (await apiRequest(`/categories/${id}/toggle-status`, {
    method: "PATCH",
  })) as { success: boolean; data: BackendCategory };

  return transformBackendCategory(response.data);
};

// ========== SERVICE API FUNCTIONS ==========

// Fetch all services with pagination and filtering
export const fetchServices = async (
  page: number = 1,
  limit: number = 10,
  salon_id?: string,
  is_completed?: boolean,
  name?: string,
  is_public?: boolean,
  category_id?: number
): Promise<PaginatedServicesResult> => {
  let endpoint = `/services?page=${page}&limit=${limit}`;

  if (salon_id) endpoint += `&salon_id=${salon_id}`;
  if (is_completed !== undefined) endpoint += `&is_completed=${is_completed}`;
  if (name) endpoint += `&name=${encodeURIComponent(name)}`;
  if (is_public !== undefined) endpoint += `&is_public=${is_public}`;
  if (category_id) endpoint += `&category_id=${category_id}`;

  const response = (await apiRequest(endpoint)) as ServicesResponse;

  return {
    services: response.data.map(transformBackendService),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch public services
export const fetchPublicServices = async (
  page: number = 1,
  limit: number = 10,
  salon_id?: string,
  category_id?: number
): Promise<PaginatedServicesResult> => {
  let endpoint = `/services/public?page=${page}&limit=${limit}`;

  if (salon_id) endpoint += `&salon_id=${salon_id}`;
  if (category_id) endpoint += `&category_id=${category_id}`;

  const response = (await apiRequest(endpoint)) as ServicesResponse;

  return {
    services: response.data.map(transformBackendService),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch completed services
export const fetchCompletedServices = async (
  page: number = 1,
  limit: number = 10,
  salon_id?: string,
  category_id?: number
): Promise<PaginatedServicesResult> => {
  let endpoint = `/services/completed?page=${page}&limit=${limit}`;

  if (salon_id) endpoint += `&salon_id=${salon_id}`;
  if (category_id) endpoint += `&category_id=${category_id}`;

  const response = (await apiRequest(endpoint)) as ServicesResponse;

  return {
    services: response.data.map(transformBackendService),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
  };
};

// Fetch services by salon
export const fetchServicesBySalon = async (
  salonId: string
): Promise<Service[]> => {
  const response = (await apiRequest(`/services/salon/${salonId}`)) as {
    data: BackendService[];
    total: number;
  };
  return response.data.map(transformBackendService);
};

// Fetch services by category
export const fetchServicesByCategory = async (
  categoryId: string
): Promise<Service[]> => {
  const response = (await apiRequest(`/services/category/${categoryId}`)) as {
    data: BackendService[];
    total: number;
  };
  return response.data.map(transformBackendService);
};

// Fetch service by ID
export const fetchServiceById = async (id: string): Promise<Service> => {
  const response = (await apiRequest(`/services/${id}`)) as {
    service: BackendService;
  };

  if (!response.service) {
    throw new ApiError("Service not found", 404);
  }

  if (!response.service.id) {
    throw new ApiError("Invalid service data received", 500);
  }

  return transformBackendService(response.service);
};

// Create new service
export const createService = async (serviceData: {
  salon_id: string;
  name: string;
  description: string;
  duration: string;
  price?: number;
  is_public: boolean;
  discount?: number;
  is_completed?: boolean;
  category_ids: number[];
}): Promise<Service> => {
  const payload: CreateServicePayload = {
    salon_id: serviceData.salon_id,
    name: serviceData.name,
    description: serviceData.description,
    duration: serviceData.duration,
    price: serviceData.price ?? 0,
    is_public: serviceData.is_public,
    discount: serviceData.discount ?? 0,
    is_completed: serviceData.is_completed ?? false,
    category_ids: serviceData.category_ids,
  };

  const response = (await apiRequest("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as ServiceResponse;

  return transformBackendService(response.service);
};

// Update service
export const updateService = async (
  id: string,
  serviceData: {
    salon_id?: string;
    name?: string;
    description?: string;
    duration?: string;
    price?: number;
    is_public?: boolean;
    discount?: number;
    is_completed?: boolean;
    category_ids?: number[];
  }
): Promise<Service> => {
  const payload: UpdateServicePayload = {};

  if (serviceData.salon_id !== undefined)
    payload.salon_id = serviceData.salon_id;
  if (serviceData.name !== undefined) payload.name = serviceData.name;
  if (serviceData.description !== undefined)
    payload.description = serviceData.description;
  if (serviceData.duration !== undefined)
    payload.duration = serviceData.duration;
  if (serviceData.price !== undefined) payload.price = serviceData.price;
  if (serviceData.is_public !== undefined)
    payload.is_public = serviceData.is_public;
  if (serviceData.discount !== undefined)
    payload.discount = serviceData.discount;
  if (serviceData.is_completed !== undefined)
    payload.is_completed = serviceData.is_completed;
  if (serviceData.category_ids !== undefined)
    payload.category_ids = serviceData.category_ids;

  const response = (await apiRequest(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })) as ServiceResponse;

  return transformBackendService(response.service);
};

// Delete service
export const deleteService = async (
  id: string
): Promise<{ message: string }> => {
  const response = (await apiRequest(`/services/${id}`, {
    method: "DELETE",
  })) as DeleteResponse;

  return { message: response.message };
};

// Toggle service public status
export const toggleServicePublicStatus = async (
  id: string
): Promise<Service> => {
  const response = (await apiRequest(`/services/${id}/toggle-public`, {
    method: "PATCH",
  })) as { success: boolean; data: BackendService };

  return transformBackendService(response.data);
};

// Toggle service completed status
export const toggleServiceCompletedStatus = async (
  id: string
): Promise<Service> => {
  const response = (await apiRequest(`/services/${id}/toggle-completed`, {
    method: "PATCH",
  })) as { success: boolean; data: BackendService };

  return transformBackendService(response.data);
};

// Update service categories
export const updateServiceCategories = async (
  id: string,
  category_ids: number[]
): Promise<Service> => {
  const response = (await apiRequest(`/services/${id}/categories`, {
    method: "PATCH",
    body: JSON.stringify({ category_ids }),
  })) as { success: boolean; data: BackendService };

  return transformBackendService(response.data);
};
