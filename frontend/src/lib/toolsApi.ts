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
  avg_rating?: number;
  ratings_count?: number;
  user_rating?: number;
  user_rating_id?: number;
  comments?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  body: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: number;
  score: number;
  tool_id: number;
  user_id: number;
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

  const endpoint = `/tools${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequestWithAuth<ToolsResponse>(endpoint, token);
}

// Get a single tool
export async function getTool(
  token: string,
  id: number
): Promise<{ data: Tool }> {
  return apiRequestWithAuth<{ data: Tool }>(`/tools/${id}`, token);
}

// Create a new tool
export async function createTool(
  token: string,
  tool: CreateToolRequest
): Promise<{ message: string; data: Tool }> {
  return apiRequestWithAuth<{ message: string; data: Tool }>("/tools", token, {
    method: "POST",
    body: JSON.stringify(tool),
  });
}

// Update an existing tool
export async function updateTool(
  token: string,
  id: number,
  tool: UpdateToolRequest
): Promise<{ message: string; data: Tool }> {
  return apiRequestWithAuth<{ message: string; data: Tool }>(
    `/tools/${id}`,
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
  return apiRequestWithAuth<{ message: string }>(`/tools/${id}`, token, {
    method: "DELETE",
  });
}

// Get categories for tools
export async function getToolCategories(
  token: string
): Promise<{ data: Category[] }> {
  return apiRequestWithAuth<{ data: Category[] }>("/tools-categories", token);
}

// Comments API
export interface CreateCommentRequest {
  body: string;
}

export async function createComment(
  token: string,
  toolId: number,
  comment: CreateCommentRequest
): Promise<{ message: string; data: Comment }> {
  return apiRequestWithAuth<{ message: string; data: Comment }>(
    `/tools/${toolId}/comments`,
    token,
    {
      method: "POST",
      body: JSON.stringify(comment),
    }
  );
}

export async function deleteComment(
  token: string,
  commentId: number
): Promise<{ message: string }> {
  return apiRequestWithAuth<{ message: string }>(
    `/comments/${commentId}`,
    token,
    {
      method: "DELETE",
    }
  );
}

// Ratings API
export interface CreateRatingRequest {
  score: number;
}

export async function createRating(
  token: string,
  toolId: number,
  rating: CreateRatingRequest
): Promise<{ message: string; data: Rating }> {
  return apiRequestWithAuth<{ message: string; data: Rating }>(
    `/tools/${toolId}/rating`,
    token,
    {
      method: "POST",
      body: JSON.stringify(rating),
    }
  );
}

export async function deleteRating(
  token: string,
  ratingId: number
): Promise<{ message: string }> {
  return apiRequestWithAuth<{ message: string }>(
    `/ratings/${ratingId}`,
    token,
    {
      method: "DELETE",
    }
  );
}
