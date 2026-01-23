import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Key, Database, Save, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemSettingsSectionProps {
  userRole: string;
}

export function SystemSettingsSection({ userRole }: SystemSettingsSectionProps) {
  const [settings, setSettings] = useState({
    session_timeout: "24",
    max_login_attempts: "5",
    rate_limit: "100",
    auto_backup_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const canEdit = userRole === "super_admin";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*");

      if (error) throw error;

      if (data) {
        const settingsMap: any = {};
        data.forEach((row: any) => {
          const key = row.setting_key;
          let value = row.setting_value;
          // Handle JSON strings
          if (typeof value === "string") {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string
            }
          }
          settingsMap[key] = value;
        });

        setSettings({
          session_timeout: settingsMap.session_timeout || "24",
          max_login_attempts: settingsMap.max_login_attempts || "5",
          rate_limit: settingsMap.rate_limit || "100",
          auto_backup_enabled: settingsMap.auto_backup_enabled === true,
        });
      }
    } catch (err: any) {
      console.error("Error fetching system settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    toast.success("Settings saved (demo mode)");
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent" />
            System Settings
          </h2>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>
        {!canEdit && (
          <Badge variant="destructive">Super Admin Only</Badge>
        )}
      </div>

      {!canEdit && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-destructive" />
              <div>
                <p className="font-medium">Super Admin Access Required</p>
                <p className="text-sm text-muted-foreground">
                  Only Super Admins can modify system settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure authentication and session security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.session_timeout}
                    onChange={(e) =>
                      setSettings({ ...settings, session_timeout: e.target.value })
                    }
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long before inactive sessions expire
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) =>
                      setSettings({ ...settings, max_login_attempts: e.target.value })
                    }
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    Failed attempts before lockout
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                <h4 className="font-medium">Security Recommendations</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Two-factor authentication is recommended for all admin accounts</p>
                  <p>✓ Regularly rotate API keys and secret keys</p>
                  <p>✓ Review activity logs for suspicious behavior</p>
                </div>
              </div>

              {canEdit && (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Settings
              </CardTitle>
              <CardDescription>Manage API keys and rate limiting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={settings.rate_limit}
                  onChange={(e) =>
                    setSettings({ ...settings, rate_limit: e.target.value })
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>API Key</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted font-mono text-sm">
                  {showApiKey
                    ? "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    : "sk_live_••••••••••••••••••••••••••••••"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this key to authenticate API requests
                </p>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Button variant="outline">Regenerate API Key</Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save API Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>Configure automated backups and recovery options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">
                    Daily automated backup of all data
                  </p>
                </div>
                <Switch
                  checked={settings.auto_backup_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, auto_backup_enabled: checked })
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Backups</h4>
                <div className="space-y-2">
                  {[
                    { date: "2026-01-23", size: "245 MB", status: "success" },
                    { date: "2026-01-22", size: "242 MB", status: "success" },
                    { date: "2026-01-21", size: "238 MB", status: "success" },
                  ].map((backup) => (
                    <div
                      key={backup.date}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <Database className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{backup.date}</p>
                          <p className="text-xs text-muted-foreground">{backup.size}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Button variant="outline">Create Manual Backup</Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Backup Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
