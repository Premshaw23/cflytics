import { useQuery } from "@tanstack/react-query";

export function useSolvedProblems() {
  return useQuery({
    queryKey: ["solved-problems"],
    queryFn: async (): Promise<{ solvedIds: string[] }> => {
      const response = await fetch("/api/user/solved-problems");
      if (!response.ok) throw new Error("Failed to fetch solved problems");
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute cache
  });
}
