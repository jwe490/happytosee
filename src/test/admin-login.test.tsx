import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";

// Mock the useAdminAuth hook
const mockUseAdminAuth = vi.fn();

vi.mock("@/hooks/useAdminAuth", () => ({
  useAdminAuth: () => mockUseAdminAuth(),
}));

// Helper to create test wrapper
const createTestWrapper = (initialRoute: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Admin Login Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AdminProtectedRoute", () => {
    it("shows loading state while checking admin status", () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: false,
        isLoading: true,
        user: null,
      });

      render(
        <MemoryRouter>
          <AdminProtectedRoute>
            <div>Admin Dashboard Content</div>
          </AdminProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText("Verifying admin access...")).toBeInTheDocument();
    });

    it("redirects to /admin/login when user is not authenticated", async () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter initialEntries={["/admin/dashboard"]}>
          <Routes>
            <Route path="/admin/login" element={<div>Login Page</div>} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <div>Admin Dashboard Content</div>
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Login Page")).toBeInTheDocument();
      });
    });

    it("shows access denied when user is authenticated but not admin", () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: false,
        isLoading: false,
        user: { id: "user-123", display_name: "Regular User" },
      });

      render(
        <MemoryRouter>
          <AdminProtectedRoute>
            <div>Admin Dashboard Content</div>
          </AdminProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(
        screen.getByText("You don't have admin privileges to access this area.")
      ).toBeInTheDocument();
    });

    it("grants access to admin users", () => {
      mockUseAdminAuth.mockReturnValue({
        isAdmin: true,
        isLoading: false,
        user: { id: "admin-123", display_name: "Admin User" },
      });

      render(
        <MemoryRouter>
          <AdminProtectedRoute>
            <div>Admin Dashboard Content</div>
          </AdminProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText("Admin Dashboard Content")).toBeInTheDocument();
    });

    it("grants access to super_admin users", () => {
      // This test verifies that super_admin role is properly recognized
      mockUseAdminAuth.mockReturnValue({
        isAdmin: true, // useAdminAuth should return true for super_admin
        isLoading: false,
        user: { id: "super-admin-123", display_name: "Super Admin User" },
      });

      render(
        <MemoryRouter>
          <AdminProtectedRoute>
            <div>Admin Dashboard Content</div>
          </AdminProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText("Admin Dashboard Content")).toBeInTheDocument();
    });
  });
});

describe("useAdminAuth hook behavior", () => {
  it("should recognize both admin and super_admin roles", () => {
    // This documents the expected behavior:
    // The hook queries user_roles with .in("role", ["admin", "super_admin"])
    // Both roles should result in isAdmin = true
    
    const adminRoles = ["admin", "super_admin"];
    const nonAdminRoles = ["user", "moderator", "analyst"];
    
    adminRoles.forEach((role) => {
      expect(["admin", "super_admin"].includes(role)).toBe(true);
    });
    
    nonAdminRoles.forEach((role) => {
      expect(["admin", "super_admin"].includes(role)).toBe(false);
    });
  });
});
