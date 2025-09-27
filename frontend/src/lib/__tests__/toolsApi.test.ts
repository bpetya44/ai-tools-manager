import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTools, createTool, deleteTool } from "../toolsApi";
import { apiRequestWithAuth } from "../api";

// Mock the api module
vi.mock("../api", () => ({
  apiRequestWithAuth: vi.fn(),
}));

const mockApiRequestWithAuth = vi.mocked(apiRequestWithAuth);

describe("toolsApi", () => {
  const mockToken = "mock-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTools", () => {
    it("should call apiRequestWithAuth with correct parameters", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: "Test Tool",
            url: "https://example.com",
            description: "A test tool",
            category: { id: 1, name: "Analytics" },
            created_by: { id: 1, name: "Admin", email: "admin@example.com" },
            created_at: "2023-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1,
        },
      };

      mockApiRequestWithAuth.mockResolvedValue(mockResponse);

      const result = await getTools(mockToken, { q: "test" });

      expect(mockApiRequestWithAuth).toHaveBeenCalledWith(
        "/tools?q=test",
        mockToken
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle search and category filters", async () => {
      const mockResponse = {
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      };

      mockApiRequestWithAuth.mockResolvedValue(mockResponse);

      await getTools(mockToken, {
        q: "analytics",
        category_id: 1,
        page: 2,
        per_page: 10,
      });

      expect(mockApiRequestWithAuth).toHaveBeenCalledWith(
        "/tools?q=analytics&category_id=1&page=2&per_page=10",
        mockToken
      );
    });
  });

  describe("createTool", () => {
    it("should call apiRequestWithAuth with POST method and tool data", async () => {
      const toolData = {
        name: "New Tool",
        url: "https://newtool.com",
        description: "A new tool",
        category_id: 1,
      };

      const mockResponse = {
        message: "Tool created successfully",
        data: {
          id: 2,
          ...toolData,
          category: { id: 1, name: "Analytics" },
          created_by: { id: 1, name: "Admin", email: "admin@example.com" },
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      };

      mockApiRequestWithAuth.mockResolvedValue(mockResponse);

      const result = await createTool(mockToken, toolData);

      expect(mockApiRequestWithAuth).toHaveBeenCalledWith("/tools", mockToken, {
        method: "POST",
        body: JSON.stringify(toolData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteTool", () => {
    it("should call apiRequestWithAuth with DELETE method", async () => {
      const toolId = 1;
      const mockResponse = {
        message: "Tool deleted successfully",
      };

      mockApiRequestWithAuth.mockResolvedValue(mockResponse);

      const result = await deleteTool(mockToken, toolId);

      expect(mockApiRequestWithAuth).toHaveBeenCalledWith(
        `/tools/${toolId}`,
        mockToken,
        {
          method: "DELETE",
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
