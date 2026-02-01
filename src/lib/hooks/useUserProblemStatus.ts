import { useQuery } from "@tanstack/react-query";

export function useUserProblemStatus() {
  return useQuery({
    queryKey: ["user-problems-status"],
    queryFn: async (): Promise<{ solvedIds: string[]; attemptedIds: string[] }> => {
      const response = await fetch("/api/user/problems-status");
      if (!response.ok) throw new Error("Failed to fetch user problem status");
      return response.json();
    },
    staleTime: 60 * 1000, 
  });
}
