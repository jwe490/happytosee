import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Film,
  Settings,
  Sliders,
  Shield,
  Activity,
  UserCog,
  Key,
  FileText,
  ChevronLeft,
  ChevronRight,
  Smile,
  Star,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
}

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
}

const navItems: NavItem[] = [
  { title: "Overview", icon: LayoutDashboard, section: "overview" },
  { title: "Mood Analytics", icon: Smile, section: "mood-analytics" },
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
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg truncate">MoodFlix</h1>
            <p className="text-xs text-muted-foreground truncate">Admin Portal</p>
          </div>
        )}
      </div>

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
                        "w-full p-3 rounded-lg flex items-center justify-center transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <button
                key={item.section}
                onClick={() => onSectionChange(item.section)}
                className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Role Badge & Collapse */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs text-muted-foreground">Your Role</p>
            <p className="text-sm font-medium capitalize text-accent">{userRole.replace("_", " ")}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
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
