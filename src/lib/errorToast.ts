import toast from "react-hot-toast";
import { ApiError } from "./userApi";

// Enhanced API Error structure based on backend validation
interface ValidationErrorResponse {
  error: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}

/**
 * Displays API errors as toast notifications
 * Handles different types of errors: general, field validation, and form errors
 */
export const showApiErrorToast = (error: unknown, customMessage?: string) => {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    const response = error.response as ValidationErrorResponse | undefined;

    if (response?.error === "ValidationError") {
      // Handle validation errors with detailed field information
      if (
        response.fieldErrors &&
        Object.keys(response.fieldErrors).length > 0
      ) {
        // Show each field error as a separate toast
        Object.entries(response.fieldErrors).forEach(([field, messages]) => {
          const fieldName = formatFieldName(field);
          messages.forEach((message) => {
            toast.error(`${fieldName}: ${message}`, {
              duration: 6000,
              id: `${field}-${message}`, // Prevent duplicate toasts
            });
          });
        });
      }

      // Show form errors if any
      if (response.formErrors && response.formErrors.length > 0) {
        response.formErrors.forEach((message) => {
          toast.error(message, {
            duration: 6000,
          });
        });
      }

      // Show general validation message if no specific field/form errors
      if (
        (!response.fieldErrors ||
          Object.keys(response.fieldErrors).length === 0) &&
        (!response.formErrors || response.formErrors.length === 0)
      ) {
        toast.error(response.message || "Validation failed", {
          duration: 6000,
        });
      }
    } else if (error.status === 409) {
      // Handle conflict errors (e.g., duplicate email)
      toast.error(
        response?.message ||
          error.message ||
          "Conflict: Resource already exists"
      );
    } else if (error.status === 404) {
      // Handle not found errors
      toast.error("Resource not found");
    } else if (error.status === 401) {
      // Handle unauthorized errors
      toast.error("Unauthorized access");
    } else if (error.status === 403) {
      // Handle forbidden errors
      toast.error("Access forbidden");
    } else if (error.status >= 500) {
      // Handle server errors
      toast.error("Server error. Please try again later.");
    } else {
      // Handle other API errors
      toast.error(error.message || customMessage || "An error occurred");
    }
  } else if (error instanceof Error) {
    // Handle general JavaScript errors
    toast.error(
      error.message || customMessage || "An unexpected error occurred"
    );
  } else {
    // Handle unknown errors
    toast.error(customMessage || "An unknown error occurred");
  }
};

/**
 * Shows a success toast message
 */
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
  });
};

/**
 * Shows a loading toast and returns the toast ID for updates
 */
export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

/**
 * Dismisses a specific toast by ID
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Updates an existing toast (useful for loading states)
 */
export const updateToast = (
  toastId: string,
  message: string,
  type: "success" | "error"
) => {
  if (type === "success") {
    toast.success(message, { id: toastId });
  } else {
    toast.error(message, { id: toastId });
  }
};

/**
 * Formats field names for display (converts snake_case to Title Case)
 */
const formatFieldName = (field: string): string => {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Handles form submission with toast notifications
 * Shows loading toast, handles success/error, and provides feedback
 */
export const handleFormSubmissionWithToast = async <T>(
  submitFn: () => Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage?: string
): Promise<T | null> => {
  const toastId = showLoadingToast(loadingMessage);

  try {
    const result = await submitFn();
    updateToast(toastId, successMessage, "success");
    return result;
  } catch (error) {
    dismissToast(toastId);
    showApiErrorToast(error, errorMessage);
    return null;
  }
};
