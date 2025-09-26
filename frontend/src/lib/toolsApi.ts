import { apiRequest, apiRequestWithAuth, ApiError } from "./api";

export interface Tool {
  id: number;
  name: string;
  url: string;
  description?: string;
  category: {
    id: number;
    name: string;
  };
  created_by?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ToolsResponse {
  data: Tool[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CreateToolRequest {
  name: string;
  url: string;
  description?: string;
  category_id: number;
}

export interface UpdateToolRequest extends CreateToolRequest {}

// Get all tools with optional filtering
export async function getTools(
  token: string,
  params?: {
    q?: string;
    category_id?: number;
    page?: number;
    per_page?: number;
  }
): Promise<ToolsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.q) queryParams.append("q", params.q);
  if (params?.category_id)
    queryParams.append("category_id", params.category_id.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());

  const endpoint = `/tools-list${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequestWithAuth<ToolsResponse>(endpoint, token);
}

// Get a single tool
export async function getTool(
  token: string,
  id: number
): Promise<{ data: Tool }> {
  return apiRequestWithAuth<{ data: Tool }>(`/tools-list/${id}`, token);
}

// Create a new tool
export async function createTool(
  token: string,
  tool: CreateToolRequest
): Promise<{ message: string; data: Tool }> {
  return apiRequestWithAuth<{ message: string; data: Tool }>(
    "/tools-list",
    token,
    {
      method: "POST",
      body: JSON.stringify(tool),
    }
  );
}

// Update an existing tool
export async function updateTool(
  token: string,
  id: number,
  tool: UpdateToolRequest
): Promise<{ message: string; data: Tool }> {
  return apiRequestWithAuth<{ message: string; data: Tool }>(
    `/tools-list/${id}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify(tool),
    }
  );
}

// Delete a tool
export async function deleteTool(
  token: string,
  id: number
): Promise<{ message: string }> {
  return apiRequestWithAuth<{ message: string }>(`/tools-list/${id}`, token, {
    method: "DELETE",
  });
}

// Get categories for tools
export async function getToolCategories(
  token: string
): Promise<{ data: Category[] }> {
  return apiRequestWithAuth<{ data: Category[] }>("/tools-categories", token);
}
