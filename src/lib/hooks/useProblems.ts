import { useQuery } from "@tanstack/react-query";
import { CFProblem } from "@/types";

interface UseProblemsProps {
  tags?: string[];
  enabled?: boolean;
}

export function useProblems({ tags, enabled = true }: UseProblemsProps = {}) {
  return useQuery({
    queryKey: ["problems", tags],
    queryFn: async (): Promise<{ problems: CFProblem[] }> => {
      const url = new URL("/api/codeforces/problems", window.location.origin);
      if (tags && tags.length > 0) {
        url.searchParams.set("tags", tags.join(";"));
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch problems");
      return response.json();
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours since problemset doesn't change much
  });
}
