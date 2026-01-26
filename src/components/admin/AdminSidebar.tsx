import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Film,
  Settings,
  Sliders,
  Shield,
  Activity,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Smile,
  Star,
  Clapperboard,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  icon: React.ElementType;
  section: string;
  requiredRole?: string[];
  badge?: string;
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

const navItems: NavItem[] = [
  { title: "Overview", icon: LayoutDashboard, section: "overview" },
  { title: "Mood Analytics", icon: Smile, section: "mood-analytics" },
  { title: "Genre Analytics", icon: Clapperboard, section: "genre-analytics", badge: "New" },
  { title: "Actor Analytics", icon: Star, section: "actor-analytics" },
  { title: "User Insights", icon: Users, section: "user-insights" },
  { title: "Content Performance", icon: Film, section: "content-performance" },
  { title: "Recommendations", icon: Sliders, section: "recommendations", requiredRole: ["admin", "super_admin"] },
  { title: "User Management", icon: UserCog, section: "user-management", requiredRole: ["super_admin"] },
  { title: "System Settings", icon: Settings, section: "system-settings", requiredRole: ["super_admin"] },
  { title: "Activity Logs", icon: Activity, section: "activity-logs", requiredRole: ["admin", "super_admin"] },
];

export function AdminSidebar({ activeSection, onSectionChange, userRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const canAccess = (item: NavItem) => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(userRole);
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border/50">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MoodFlix
            </h1>
            <p className="text-xs text-muted-foreground truncate">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-3 border-b border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <Home className="w-4 h-4" />
            Back to Site
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
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
                      onClick={() => onSectionChange(item.section)}
                      className={cn(
                        "w-full p-3 rounded-xl flex items-center justify-center transition-all relative",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left group",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive && "drop-shadow-sm")} />
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "bg-accent text-accent-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Role Badge & Collapse */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
            <p className="text-xs text-muted-foreground">Your Role</p>
            <p className="text-sm font-semibold capitalize bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {userRole.replace("_", " ")}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
