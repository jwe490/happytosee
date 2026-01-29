import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyAuth } from "@/hooks/useKeyAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEnhancedAdminAnalytics } from "@/hooks/useEnhancedAdminAnalytics";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OverviewSection } from "@/components/admin/sections/OverviewSection";
import { MoodInsightsSection } from "@/components/admin/sections/MoodInsightsSection";
import { UserActivitySection } from "@/components/admin/sections/UserActivitySection";
import { WatchlistStatsSection } from "@/components/admin/sections/WatchlistStatsSection";
import { ReviewsStatsSection } from "@/components/admin/sections/ReviewsStatsSection";
import { UserSessionsSection } from "@/components/admin/sections/UserSessionsSection";
import { UserManagementSection } from "@/components/admin/sections/UserManagementSection";
import { SystemSettingsSection } from "@/components/admin/sections/SystemSettingsSection";
import { EngagementAnalyticsSection } from "@/components/admin/sections/EngagementAnalyticsSection";
import { SiteEditorSection } from "@/components/admin/sections/SiteEditorSection";
import { RealTimeStatsPanel } from "@/components/admin/RealTimeStatsPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useKeyAuth();
  const { role, isLoading: roleLoading } = useAdminAuth();
  const [activeSection, setActiveSection] = useState("overview");
  
  const {
    stats,
    moodData,
    topWatchlisted,
    topRecommended,
    moodAnalytics,
    contentPerformance,
    demographics,
    isLoading: analyticsLoading,
    refetch,
  } = useEnhancedAdminAnalytics();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.success("Signed out");
  };

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Data refreshed");
  }, [refetch]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Real-Time Analytics Panel */}
            <RealTimeStatsPanel />
            
            {/* Traditional Overview Stats */}
            <OverviewSection
              stats={stats}
              moodData={moodData}
              topWatchlisted={topWatchlisted}
              topRecommended={topRecommended}
              isLoading={analyticsLoading}
            />
          </div>
        );
      case "engagement-analytics":
        return <EngagementAnalyticsSection />;
      case "user-activity":
        return <UserActivitySection stats={stats} isLoading={analyticsLoading} />;
      case "mood-analytics":
        return <MoodInsightsSection moodAnalytics={moodAnalytics} moodData={moodData} isLoading={analyticsLoading} />;
      case "watchlist-stats":
        return <WatchlistStatsSection topWatchlisted={topWatchlisted} stats={stats} isLoading={analyticsLoading} />;
      case "reviews-stats":
        return <ReviewsStatsSection contentPerformance={contentPerformance} totalReviews={stats?.total_reviews || 0} isLoading={analyticsLoading} />;
      case "user-sessions":
        return <UserSessionsSection demographics={demographics} stats={stats} isLoading={analyticsLoading} />;
      case "site-editor":
        return <SiteEditorSection />;
      case "user-management":
        return <UserManagementSection userRole={role} />;
      case "system-settings":
        return <SystemSettingsSection userRole={role} />;
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
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={role}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
          
          <div className="flex-1 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Refresh</span>
            </Button>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
              <span className="text-muted-foreground">Signed in as</span>
              <span className="font-medium">{user?.display_name || "Admin"}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
