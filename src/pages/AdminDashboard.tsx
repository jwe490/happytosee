import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { MoodAnalyticsSection } from "@/components/admin/sections/MoodAnalyticsSection";
import { ActorAnalyticsSection } from "@/components/admin/sections/ActorAnalyticsSection";
import { UserInsightsSection } from "@/components/admin/sections/UserInsightsSection";
import { ContentPerformanceSection } from "@/components/admin/sections/ContentPerformanceSection";
import { RecommendationsSection } from "@/components/admin/sections/RecommendationsSection";
import { UserManagementSection } from "@/components/admin/sections/UserManagementSection";
import { SystemSettingsSection } from "@/components/admin/sections/SystemSettingsSection";
import { ActivityLogsSection } from "@/components/admin/sections/ActivityLogsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useKeyAuth();
  const { role, isLoading: roleLoading } = useAdminRole();
  const [activeSection, setActiveSection] = useState("overview");

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Signed out successfully");
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection userRole={role} />;
      case "mood-analytics":
        return <MoodAnalyticsSection userRole={role} />;
      case "actor-analytics":
        return <ActorAnalyticsSection userRole={role} />;
      case "user-insights":
        return <UserInsightsSection userRole={role} />;
      case "content-performance":
        return <ContentPerformanceSection userRole={role} />;
      case "recommendations":
        return <RecommendationsSection userRole={role} />;
      case "user-management":
        return <UserManagementSection userRole={role} />;
      case "system-settings":
        return <SystemSettingsSection userRole={role} />;
      case "activity-logs":
        return <ActivityLogsSection userRole={role} />;
      default:
        return <OverviewSection userRole={role} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={role}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader
          user={user}
          userRole={role}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
