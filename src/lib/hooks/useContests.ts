import { useQuery } from '@tanstack/react-query';
import { CFContest } from '@/types';

export function useContests(gym = false) {
  const query = useQuery({
    queryKey: ['contests', gym],
    queryFn: async (): Promise<CFContest[]> => {
      const response = await fetch(`/api/codeforces/contests?gym=${gym}`);
      if (!response.ok) throw new Error('Failed to fetch contests');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (client side cache)
  });

  const upcoming = query.data?.filter(c => c.phase === "BEFORE" || c.phase === "CODING").reverse() || [];
  const past = query.data?.filter(c => c.phase === "FINISHED") || [];

  return {
    ...query,
    upcoming,
    past
  };
}
