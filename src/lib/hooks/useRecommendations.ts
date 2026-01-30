import { useMemo } from 'react';
import { useUserData } from './useUserData';
import { useProblems } from './useProblems';
import { CFProblem } from '@/types';

interface UseRecommendationsProps {
  handle: string;
  tag?: string | null;
}

export function useRecommendations({ handle, tag }: UseRecommendationsProps) {
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
    
    const candidates = problemData.problems.filter(p => {
       const id = `${p.contestId}-${p.index}`;
       if (solvedProblems.has(id)) return false;
       if (!p.rating) return false;
       
       // Tag Filter
       if (tag && !p.tags.includes(tag)) return false;

       return p.rating >= minRating && p.rating <= maxRating;
    });

    return candidates.slice(0, 50); // Return pool of 50
  }, [userInfo.data, userStatus.data, problemData?.problems, tag]);

  return {
    recommendations,
    isLoading: isUserLoading || isProblemsLoading,
    userRating: userInfo.data?.rating
  };
}
