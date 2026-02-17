import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserMinus, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  favorite_genres: string[] | null;
}

const Community = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followerIds, setFollowerIds] = useState<Set<string>>(new Set());

  // Fetch all public users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, display_name, bio, avatar_url, favorite_genres, is_public")
          .eq("is_public", true)
          .limit(50);

        if (error) throw error;
        setUsers(
          (data || []).map((p: any) => ({
            id: p.user_id,
            display_name: p.display_name || "User",
            bio: p.bio,
            avatar_url: p.avatar_url,
            favorite_genres: p.favorite_genres,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch follow relationships
  useEffect(() => {
    if (!user?.id) return;
    const fetchFollows = async () => {
      const [{ data: followingData }, { data: followerData }] = await Promise.all([
        supabase.from("user_follows").select("following_id").eq("follower_id", user.id),
        supabase.from("user_follows").select("follower_id").eq("following_id", user.id),
      ]);
      setFollowingIds(new Set((followingData || []).map((f: any) => f.following_id)));
      setFollowerIds(new Set((followerData || []).map((f: any) => f.follower_id)));
    };
    fetchFollows();
  }, [user?.id]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.display_name.toLowerCase().includes(q));
  }, [users, searchQuery]);

  const followerProfiles = useMemo(() => users.filter(u => followerIds.has(u.id)), [users, followerIds]);
  const followingProfiles = useMemo(() => users.filter(u => followingIds.has(u.id)), [users, followingIds]);

  const handleFollow = async (targetId: string) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Sign in to follow users");
      return;
    }
    try {
      await supabase.from("user_follows").insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds(prev => new Set([...prev, targetId]));
      toast.success("Following!");
    } catch {
      toast.error("Failed to follow");
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!user?.id) return;
    try {
      await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setFollowingIds(prev => { const next = new Set(prev); next.delete(targetId); return next; });
      toast.success("Unfollowed");
    } catch {
      toast.error("Failed to unfollow");
    }
  };

  const UserCard = ({ user: u }: { user: UserProfile }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0">
        {u.avatar_url ? (
          <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{u.display_name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{u.display_name}</p>
        {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
        {u.favorite_genres && u.favorite_genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {u.favorite_genres.slice(0, 3).map(g => (
              <span key={g} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        )}
      </div>
      {u.id !== user?.id && (
        followingIds.has(u.id) ? (
          <Button variant="outline" size="sm" onClick={() => handleUnfollow(u.id)} className="h-8 text-xs gap-1">
            <UserMinus className="w-3.5 h-3.5" /> Unfollow
          </Button>
        ) : (
          <Button size="sm" onClick={() => handleFollow(u.id)} className="h-8 text-xs gap-1">
            <UserPlus className="w-3.5 h-3.5" /> Follow
          </Button>
        )
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-foreground" />
          <h1 className="text-2xl font-bold">Community</h1>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Sign in to follow users and build your community</p>
            <Button size="sm" onClick={() => window.location.href = "/auth"}>Sign In</Button>
          </div>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-9 h-10" />
        </div>

        <Tabs defaultValue="discover">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
            <TabsTrigger value="following" className="flex-1">Following ({followingIds.size})</TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">Followers ({followerIds.size})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
            ) : (
              filteredUsers.map(u => <UserCard key={u.id} user={u} />)
            )}
          </TabsContent>
          <TabsContent value="following" className="space-y-3">
            {followingProfiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Not following anyone yet</div>
            ) : followingProfiles.map(u => <UserCard key={u.id} user={u} />)}
          </TabsContent>
          <TabsContent value="followers" className="space-y-3">
            {followerProfiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No followers yet</div>
            ) : followerProfiles.map(u => <UserCard key={u.id} user={u} />)}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
