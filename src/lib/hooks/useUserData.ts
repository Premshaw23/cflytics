import { useQuery } from "@tanstack/react-query";
import { CFUser, CFSubmission, CFRatingChange } from "@/types";

interface UseUserDataProps {
  handle: string;
  enabled?: boolean;
}

export function useUserData({ handle, enabled = true }: UseUserDataProps) {
  // Fetch user info
  const userInfo = useQuery({
    queryKey: ["user", "info", handle],
    queryFn: async (): Promise<CFUser[]> => {
      const response = await fetch(`/api/codeforces/user?handles=${handle}`);
      if (!response.ok) throw new Error("Failed to fetch user info");
      return response.json();
    },
    enabled: !!handle && enabled,
    refetchInterval: (() => {
      if (typeof window === 'undefined') return undefined;
      const saved = localStorage.getItem("cflytics_refresh_interval");
      if (!saved || saved === "0") return undefined;
      return parseInt(saved) * 60 * 1000;
    })(),
  });

  // Fetch rating history
  const ratingHistory = useQuery({
    queryKey: ["user", "rating", handle],
    queryFn: async (): Promise<CFRatingChange[]> => {
      // Create a direct API call or use the route (we need to make sure we have this route)
      const response = await fetch(`/api/codeforces/rating?handle=${handle}`);
      if (!response.ok) throw new Error("Failed to fetch rating history");
      return response.json();
    },
    enabled: !!handle && enabled,
    refetchInterval: (() => {
      if (typeof window === 'undefined') return undefined;
      const saved = localStorage.getItem("cflytics_refresh_interval");
      if (!saved || saved === "0") return undefined;
      return parseInt(saved) * 60 * 1000;
    })(),
  });

  // Fetch submissions (user status)
  const userStatus = useQuery({
    queryKey: ["user", "status", handle],
    queryFn: async (): Promise<CFSubmission[]> => {
      const response = await fetch(`/api/analytics/submissions?handle=${handle}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      return response.json();
    },
    enabled: !!handle && enabled,
    refetchInterval: (() => {
      if (typeof window === 'undefined') return undefined;
      const saved = localStorage.getItem("cflytics_refresh_interval");
      if (!saved || saved === "0") return undefined;
      return parseInt(saved) * 60 * 1000;
    })(),
  });

  return {
    userInfo: {
      data: userInfo.data?.[0],
      isLoading: userInfo.isLoading,
      isError: userInfo.isError,
      error: userInfo.error,
    },
    ratingHistory: {
      data: ratingHistory.data,
      isLoading: ratingHistory.isLoading,
      isError: ratingHistory.isError,
      error: ratingHistory.error,
    },
    userStatus: {
      data: userStatus.data,
      isLoading: userStatus.isLoading,
      isError: userStatus.isError,
      error: userStatus.error,
      refetch: userStatus.refetch
    },
    isLoading: userInfo.isLoading || ratingHistory.isLoading || userStatus.isLoading,
  };
}
