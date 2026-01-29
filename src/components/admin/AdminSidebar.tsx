import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Film,
  Settings,
  Activity,
  MousePointerClick,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Smile,
  Home,
  Menu,
  X,
  Bookmark,
  Star,
  Clock,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  title: string;
  icon: React.ElementType;
  section: string;
  requiredRole?: string[];
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

const navItems: NavItem[] = [
  { title: "Overview", icon: LayoutDashboard, section: "overview" },
  { title: "Engagement", icon: MousePointerClick, section: "engagement-analytics" },
  { title: "User Activity", icon: Activity, section: "user-activity" },
  { title: "Mood Insights", icon: Smile, section: "mood-analytics" },
  { title: "Watchlist Stats", icon: Bookmark, section: "watchlist-stats" },
  { title: "Reviews & Ratings", icon: Star, section: "reviews-stats" },
  { title: "User Sessions", icon: Clock, section: "user-sessions" },
  { title: "Site Editor", icon: Palette, section: "site-editor", requiredRole: ["admin", "super_admin"] },
  { title: "User Management", icon: UserCog, section: "user-management", requiredRole: ["super_admin"] },
  { title: "Settings", icon: Settings, section: "system-settings", requiredRole: ["super_admin"] },
];

function SidebarContent({ 
  activeSection, 
  onSectionChange, 
  userRole, 
  collapsed,
  onNavigate,
}: AdminSidebarProps & { collapsed: boolean; onNavigate: () => void }) {
  const navigate = useNavigate();

  const canAccess = (item: NavItem) => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(userRole);
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Film className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold text-base truncate">Admin</h1>
            <p className="text-xs text-muted-foreground truncate capitalize">{userRole.replace("_", " ")}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-3 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-9"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4" />
            Back to Site
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            if (!canAccess(item)) return null;
            
            const isActive = activeSection === item.section;
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.section} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onSectionChange(item.section);
                        onNavigate();
                      }}
                      className={cn(
                        "w-full p-2.5 rounded-lg flex items-center justify-center transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.section}
                onClick={() => {
                  onSectionChange(item.section);
                  onNavigate();
                }}
                className={cn(
                  "w-full p-2.5 rounded-lg flex items-center gap-2.5 transition-colors text-left text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </>
  );
}

export function AdminSidebar({ activeSection, onSectionChange, userRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden h-9 w-9"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full flex flex-col">
            <SidebarContent
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              userRole={userRole}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 border-r border-border bg-card hidden lg:flex flex-col transition-all duration-200",
          collapsed ? "w-14" : "w-56"
        )}
      >
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          userRole={userRole}
          collapsed={collapsed}
          onNavigate={() => {}}
        />
        
        {/* Collapse Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-8 justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
