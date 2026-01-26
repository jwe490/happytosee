import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Home, LogOut, Bell, Moon, Sun, Shield, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

interface AdminHeaderProps {
  user: { display_name: string; id: string } | null;
  userRole: string;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function AdminHeader({ user, userRole, onRefresh, onSignOut }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0";
      case "admin":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0";
      case "moderator":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0";
      case "analyst":
        return "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Branding */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <Badge className={`hidden sm:flex ${getRoleBadgeColor(userRole)} capitalize`}>
            <Shield className="w-3 h-3 mr-1" />
            {userRole.replace("_", " ")}
          </Badge>

          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh} 
            title="Refresh Data"
            className="hover:bg-accent/10 hover:text-accent"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
            className="hover:bg-accent/10 hover:text-accent"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            title="Notifications" 
            className="relative hover:bg-accent/10 hover:text-accent"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")} 
            title="Go to Site"
            className="hover:bg-accent/10 hover:text-accent"
          >
            <Home className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.display_name}</p>
                  <Badge className={`w-fit text-xs ${getRoleBadgeColor(userRole)} capitalize`}>
                    {userRole.replace("_", " ")}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer">
                <Home className="w-4 h-4 mr-2" />
                Back to Site
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
