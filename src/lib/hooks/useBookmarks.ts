import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@prisma/client";
import { toast } from "sonner";

export function useBookmarks(handle: string) {
  const queryClient = useQueryClient();

  const { data: bookmarks, isLoading, isError } = useQuery({
    queryKey: ["bookmarks", handle],
    queryFn: async (): Promise<Bookmark[]> => {
      if (!handle) return [];
      const response = await fetch(`/api/bookmarks?handle=${handle}`);
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      const data = await response.json();
      return data.bookmarks || [];
    },
    enabled: !!handle,
  });

  const toggleBookmark = useMutation({
    mutationFn: async ({ problemId, name, rating }: { problemId: string; name: string; rating?: number }) => {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, problemId, name, rating }),
      });
      if (!response.ok) throw new Error("Failed to toggle bookmark");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", handle] });
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
    isBookmarked: (problemId: string) => bookmarks?.some(b => b.problemId === problemId) || false,
  };
}
