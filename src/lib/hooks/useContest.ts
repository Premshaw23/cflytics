import { useQuery } from "@tanstack/react-query";
import { CFContest, CFProblem } from "@/types";

interface ContestData {
  contest: CFContest;
  problems: CFProblem[];
  rows: any[];
}

export function useContest(id: string | number, enabled = true) {
  return useQuery({
    queryKey: ["contest", id],
    queryFn: async (): Promise<ContestData> => {
      const response = await fetch(`/api/codeforces/contest?id=${id}&count=10`);
      if (!response.ok) throw new Error("Failed to fetch contest info");
      return response.json();
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
