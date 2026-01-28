import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, TrendingUp, Activity, Smartphone, Laptop } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface UserSessionsSectionProps {
  demographics: {
    total_users: number;
    new_vs_returning: { new_users: number; returning_users: number };
  } | null;
  stats: {
    active_users_7d: number;
    active_users_30d?: number;
    total_users: number;
  } | null;
  isLoading: boolean;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

export function UserSessionsSection({ demographics, stats, isLoading }: UserSessionsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const newUsers = demographics?.new_vs_returning.new_users || 0;
  const returningUsers = demographics?.new_vs_returning.returning_users || 0;
  const totalUsers = demographics?.total_users || stats?.total_users || 0;

  const retentionRate = totalUsers > 0 
    ? ((returningUsers / totalUsers) * 100).toFixed(0) 
    : "0";

  const userTypeData = [
    { name: "Returning", value: returningUsers },
    { name: "New", value: newUsers },
  ];

  // Mock device data (would come from real analytics)
  const deviceData = [
    { device: "Mobile", count: Math.floor(totalUsers * 0.6), icon: Smartphone },
    { device: "Desktop", count: Math.floor(totalUsers * 0.4), icon: Laptop },
  ];

  // Mock session metrics
  const avgSessionDuration = "8m 32s";
  const pagesPerSession = "4.2";
  const bounceRate = "28%";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          User Sessions
        </h2>
        <p className="text-sm text-muted-foreground">Session metrics and user behavior patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-xl font-semibold">{avgSessionDuration}</p>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pages/Session</p>
                <p className="text-xl font-semibold">{pagesPerSession}</p>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Bounce Rate</p>
                <p className="text-xl font-semibold">{bounceRate}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Retention</p>
                <p className="text-xl font-semibold">{retentionRate}%</p>
              </div>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* New vs Returning */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New vs Returning Users</CardTitle>
            <CardDescription className="text-xs">User acquisition and retention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {userTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{returningUsers} Returning</p>
                    <p className="text-xs text-muted-foreground">
                      {totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{newUsers} New</p>
                    <p className="text-xs text-muted-foreground">
                      {totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Device Usage</CardTitle>
            <CardDescription className="text-xs">How users access your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.device} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <device.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{device.device}</span>
                      <span className="text-sm text-muted-foreground">{device.count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${totalUsers > 0 ? (device.count / totalUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {totalUsers > 0 ? ((device.count / totalUsers) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Users */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Users Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-semibold">{stats?.active_users_7d || 0}</p>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-semibold">{stats?.active_users_30d || 0}</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-semibold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
