import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useEnhancedAdminAnalytics } from "@/hooks/useEnhancedAdminAnalytics";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminGlobalFilters, AdminFilters } from "@/components/admin/AdminGlobalFilters";
import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { MoodAnalyticsSection } from "@/components/admin/sections/MoodAnalyticsSection";
import { ActorAnalyticsSection } from "@/components/admin/sections/ActorAnalyticsSection";
import { GenreAnalyticsSection } from "@/components/admin/sections/GenreAnalyticsSection";
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
  const [filters, setFilters] = useState<AdminFilters>({
    language: "all",
    region: "all",
    timeRange: "weekly",
  });
  
  const {
    stats,
    moodData,
    topWatchlisted,
    topRecommended,
    moodAnalytics,
    contentPerformance,
    demographics,
    actorAnalytics,
    isLoading: analyticsLoading,
    setTimeRange,
    refetch,
  } = useEnhancedAdminAnalytics();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Signed out successfully");
  };

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Data refreshed");
  }, [refetch]);

  const handleFiltersChange = (newFilters: AdminFilters) => {
    setFilters(newFilters);
    if (newFilters.timeRange !== filters.timeRange) {
      setTimeRange(newFilters.timeRange);
    }
    // In a production app, you would also filter data by language/region here
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
        return (
          <OverviewSection
            stats={stats}
            moodData={moodData}
            topWatchlisted={topWatchlisted}
            topRecommended={topRecommended}
            isLoading={analyticsLoading}
          />
        );
      case "mood-analytics":
        return <MoodAnalyticsSection moodAnalytics={moodAnalytics} isLoading={analyticsLoading} onTimeRangeChange={setTimeRange} />;
      case "actor-analytics":
        return <ActorAnalyticsSection actorData={actorAnalytics} isLoading={analyticsLoading} />;
      case "genre-analytics":
        return <GenreAnalyticsSection isLoading={analyticsLoading} />;
      case "user-insights":
        return <UserInsightsSection demographics={demographics} isLoading={analyticsLoading} />;
      case "content-performance":
        return <ContentPerformanceSection contentPerformance={contentPerformance} isLoading={analyticsLoading} />;
      case "recommendations":
        return <RecommendationsSection userRole={role} />;
      case "user-management":
        return <UserManagementSection userRole={role} />;
      case "system-settings":
        return <SystemSettingsSection userRole={role} />;
      case "activity-logs":
        return <ActivityLogsSection userRole={role} />;
      default:
        return (
          <OverviewSection
            stats={stats}
            moodData={moodData}
            topWatchlisted={topWatchlisted}
            topRecommended={topRecommended}
            isLoading={analyticsLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={role}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminHeader
          user={user}
          userRole={role}
          onRefresh={handleRefresh}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-auto">
          {/* Global Filters Bar */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-3">
            <AdminGlobalFilters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
            />
          </div>

          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {renderSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
