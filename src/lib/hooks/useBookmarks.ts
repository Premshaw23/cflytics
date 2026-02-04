import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/store/useAuth";
import { guestStorage, type GuestBookmark } from "@/lib/storage/guest";
import { normalizeProblemId } from "@/lib/utils";

export function useBookmarks(handle: string) {
  const queryClient = useQueryClient();
  const authStatus = useAuth((s) => s.status);
  const isConnected = authStatus === "connected";

  const { data: bookmarks, isLoading, isError } = useQuery({
    queryKey: ["bookmarks", isConnected ? "me" : handle],
    queryFn: async (): Promise<GuestBookmark[]> => {
      if (isConnected) {
        const response = await fetch(`/api/bookmarks`);
        if (!response.ok) throw new Error("Failed to fetch bookmarks");
        const data = await response.json();
        return data.bookmarks || [];
      }

      if (!handle) return [];
      return guestStorage.bookmarks.list(handle);
    },
    enabled: isConnected || !!handle,
  });

  const toggleBookmark = useMutation({
    mutationFn: async ({ problemId, name, rating }: { problemId: string; name: string; rating?: number }) => {
      if (isConnected) {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId, name, rating }),
        });
        if (!response.ok) throw new Error("Failed to toggle bookmark");
        return response.json();
      }

      if (!handle) throw new Error("No handle set");
      return guestStorage.bookmarks.toggle(handle, {
        problemId,
        name,
        rating: rating ?? null,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", isConnected ? "me" : handle] });
      toast.success(data.bookmarked ? "Problem bookmarked" : "Bookmark removed");
    },
    onError: () => {
      toast.error("Failed to update bookmark");
    }
  });

  return {
    bookmarks,
    isLoading,
    isError,
    toggleBookmark,
    isBookmarked: (id: string) => {
      const normId = normalizeProblemId(id);
      return bookmarks?.some(b => normalizeProblemId(b.problemId) === normId) || false;
    },
  };
}
