import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useFollows(targetUserId?: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCounts = useCallback(async (uid: string) => {
    const [{ count: followers }, { count: following }] = await Promise.all([
      supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", uid),
      supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", uid),
    ]);
    setFollowersCount(followers ?? 0);
    setFollowingCount(following ?? 0);
  }, []);

  useEffect(() => {
    if (!targetUserId) return;
    fetchCounts(targetUserId);

    if (user?.id && targetUserId !== user.id) {
      supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle()
        .then(({ data }) => setIsFollowing(!!data));
    }
  }, [targetUserId, user?.id, fetchCounts]);

  const toggleFollow = useCallback(async () => {
    if (!user?.id || !targetUserId || targetUserId === user.id) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("user_follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId);
        setIsFollowing(false);
        setFollowersCount(c => Math.max(0, c - 1));
        toast("Unfollowed");
      } else {
        await supabase.from("user_follows").insert({ follower_id: user.id, following_id: targetUserId });
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
        toast("Following!");
      }
    } catch {
      toast.error("Failed to update follow");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, targetUserId, isFollowing]);

  return { isFollowing, followersCount, followingCount, toggleFollow, isLoading };
}
