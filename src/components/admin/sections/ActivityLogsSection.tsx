import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Search, Filter, User, Settings, Shield, Sliders } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  created_at: string;
}

interface ActivityLogsSectionProps {
  userRole: string;
}

export function ActivityLogsSection({ userRole }: ActivityLogsSectionProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock logs for demonstration
  const mockLogs: ActivityLog[] = [
    {
      id: "1",
      admin_id: "abc123",
      admin_name: "Mooood",
      action: "Updated recommendation settings",
      resource_type: "settings",
      resource_id: "mood_weights",
      details: {},
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      admin_id: "abc123",
      admin_name: "Mooood",
      action: "Added admin role",
      resource_type: "user",
      resource_id: "def456",
      details: { role: "analyst" },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      admin_id: "abc123",
      admin_name: "Mooood",
      action: "Enabled trending override",
      resource_type: "settings",
      resource_id: "trending_override",
      details: {},
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "4",
      admin_id: "abc123",
      admin_name: "Mooood",
      action: "Viewed analytics dashboard",
      resource_type: "analytics",
      resource_id: null,
      details: {},
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  const filteredLogs = displayLogs.filter((log) => {
    const matchesSearch =
      log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = actionFilter === "all" || log.resource_type === actionFilter;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (resourceType: string | null) => {
    switch (resourceType) {
      case "settings":
        return <Settings className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "analytics":
        return <Activity className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("Added") || action.includes("Created")) return "bg-accent/20 text-accent";
    if (action.includes("Removed") || action.includes("Deleted")) return "bg-destructive/20 text-destructive";
    if (action.includes("Updated") || action.includes("Enabled")) return "bg-primary/20 text-primary";
    return "bg-muted text-muted-foreground";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-accent" />
          Activity Logs
        </h2>
        <p className="text-muted-foreground">Track admin actions and system events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="user">User Management</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {filteredLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{log.admin_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded ${getActionColor(log.action)}`}>
                        {getActionIcon(log.resource_type)}
                      </span>
                      <span>{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.resource_type ? (
                      <Badge variant="outline">
                        {log.resource_type}
                        {log.resource_id && `: ${log.resource_id.slice(0, 8)}...`}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{formatTimeAgo(log.created_at)}</span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No activity logs found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Actions</p>
                <p className="text-3xl font-bold">
                  {filteredLogs.filter((l) => {
                    const today = new Date().toDateString();
                    return new Date(l.created_at).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Admins</p>
                <p className="text-3xl font-bold">
                  {new Set(filteredLogs.map((l) => l.admin_id)).size}
                </p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Settings Changes</p>
                <p className="text-3xl font-bold">
                  {filteredLogs.filter((l) => l.resource_type === "settings").length}
                </p>
              </div>
              <Sliders className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
