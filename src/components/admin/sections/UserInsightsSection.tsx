import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, Smartphone, Laptop, Monitor, PieChart } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface UserInsightsSectionProps {
  demographics: {
    by_gender: Array<{ gender: string; count: number }>;
    new_vs_returning: { new_users: number; returning_users: number };
    total_users: number;
  } | null;
  isLoading: boolean;
}

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
];

const genderEmojis: Record<string, string> = {
  male: "👨",
  female: "👩",
  other: "🧑",
  prefer_not_to_say: "❓",
};

export function UserInsightsSection({ demographics, isLoading }: UserInsightsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const genderData = demographics?.by_gender || [];
  const newVsReturning = demographics?.new_vs_returning || { new_users: 0, returning_users: 0 };
  const totalUsers = demographics?.total_users || 0;

  // Mock device data (in production, this would come from analytics)
  const deviceData = [
    { device: "Mobile", count: Math.floor(totalUsers * 0.55), icon: Smartphone },
    { device: "Desktop", count: Math.floor(totalUsers * 0.35), icon: Laptop },
    { device: "Tablet", count: Math.floor(totalUsers * 0.10), icon: Monitor },
  ];

  const userTypeData = [
    { name: "New Users", value: newVsReturning.new_users },
    { name: "Returning Users", value: newVsReturning.returning_users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-accent" />
          User Insights
        </h2>
        <p className="text-muted-foreground">
          Understand your user base demographics and behavior
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Users (30d)</p>
                <p className="text-3xl font-bold">{newVsReturning.new_users}</p>
              </div>
              <UserPlus className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Returning Users</p>
                <p className="text-3xl font-bold">{newVsReturning.returning_users}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-3xl font-bold">
                  {totalUsers > 0
                    ? ((newVsReturning.returning_users / totalUsers) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>User breakdown by gender</CardDescription>
              </CardHeader>
              <CardContent>
                {genderData.length > 0 ? (
                  <div className="space-y-4">
                    {genderData.map((item) => (
                      <div key={item.gender} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {genderEmojis[item.gender?.toLowerCase()] || "🧑"}
                            </span>
                            <span className="font-medium capitalize">{item.gender || "Unknown"}</span>
                          </div>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <Progress
                          value={(item.count / Math.max(...genderData.map((g) => g.count), 1)) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No gender data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New vs Returning Users</CardTitle>
                <CardDescription>User engagement breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {userTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device Usage</CardTitle>
              <CardDescription>Platform breakdown by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deviceData.map((device) => (
                  <Card key={device.device} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center gap-4">
                        <device.icon className="w-12 h-12 text-accent" />
                        <div className="text-center">
                          <p className="text-2xl font-bold">{device.count.toLocaleString()}</p>
                          <p className="text-muted-foreground">{device.device}</p>
                          <Badge variant="secondary" className="mt-2">
                            {((device.count / totalUsers) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>How users interact with the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Engagement Indicators</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Average Session Duration</span>
                      <span className="font-bold">12 min</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Pages per Session</span>
                      <span className="font-bold">5.2</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Bounce Rate</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Recommendation Click Rate</span>
                      <span className="font-bold">67%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Feature Usage</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Mood Selection</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Watchlist</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Reviews</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Collections</span>
                        <span>28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
