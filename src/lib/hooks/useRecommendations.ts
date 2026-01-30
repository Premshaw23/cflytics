import { useMemo } from 'react';
import { useUserData } from './useUserData';
import { useProblems } from './useProblems';
import { CFProblem } from '@/types';

interface UseRecommendationsProps {
  handle: string;
}

export function useRecommendations({ handle }: UseRecommendationsProps) {
  const { userInfo, userStatus, isLoading: isUserLoading } = useUserData({ handle, enabled: !!handle });
  const { data: problemData, isLoading: isProblemsLoading } = useProblems();

  const recommendations = useMemo(() => {
    if (!userInfo.data || !userStatus.data || !problemData?.problems) return [];

    const userRating = userInfo.data.rating || 1200; // Default to 1200 if unrated
    const minRating = userRating;
    const maxRating = userRating + 300; // Challenge zone
    
    // Create Set of solved problem IDs formatted as "ContestId-Index"
    const solvedProblems = new Set<string>();
    userStatus.data.forEach(sub => {
      if (sub.verdict === "OK") {
        solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    // Strategy: 
    // 1. Filter by rating range
    // 2. Remove already solved problems
    // 3. Shuffle/Sort? Let's just return a list for now.
    
    const candidates = problemData.problems.filter(p => {
       const id = `${p.contestId}-${p.index}`;
       if (solvedProblems.has(id)) return false;
       if (!p.rating) return false;
       return p.rating >= minRating && p.rating <= maxRating;
    });

    // Simple randomization to keep it fresh, or sort by solved count (popularity)
    // Let's sort by popularity (assuming solvedCount might be available later, but for now random/default)
    // Actually default CF order is by contest ID descending (newest). That's good.
    // Let's take 20 recent relevant problems.
    
    return candidates.slice(0, 50); // Return pool of 50
  }, [userInfo.data, userStatus.data, problemData?.problems]);

  return {
    recommendations,
    isLoading: isUserLoading || isProblemsLoading,
    userRating: userInfo.data?.rating
  };
}
