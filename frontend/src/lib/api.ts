// API utility functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8201/api";

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  user?: any;
  token?: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? "" : "/"
  }${endpoint}`;

  // Debug logging removed for production

  // Body logging removed for production

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // Handle 204 No Content responses
    if (response.status === 204) {
      return { message: "Success" };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    // Network error logging removed for production

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Network error. Please check your connection and try again.",
      0,
      error
    );
  }
}

export async function apiRequestWithAuth<T = any>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const authOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    return await apiRequest<T>(endpoint, authOptions);
  } catch (error) {
    // Handle 401 errors globally
    if (error instanceof ApiError && error.status === 401) {
      console.warn(
        "Authentication failed, clearing token and redirecting to login"
      );

      // Clear stored authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw error;
  }
}
