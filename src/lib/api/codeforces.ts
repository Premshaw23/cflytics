import { CF_API_BASE_URL } from "@/config/constants";
import { 
  CFUser, 
  CFProblem, 
  CFSubmission, 
  CFRatingChange, 
  CFContest,
  ApiResponse 
} from "@/types";

async function fetchFromCF<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });

  const url = `${CF_API_BASE_URL}${path}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    const data: ApiResponse<T> = await response.json();

    if (data.status !== "OK") {
      throw new Error(data.comment || "Failed to fetch from Codeforces API");
    }

    if (data.result === undefined) {
      throw new Error("No result returned from Codeforces API");
    }

    return data.result;
  } catch (error) {
    console.error(`Error fetching from CF (${path}):`, error);
    throw error;
  }
}

export const codeforcesApi = {
  /**
   * Returns information about one or several users.
   * @param handles Semicolon-separated list of handles.
   */
  async getUserInfo(handles: string[]): Promise<CFUser[]> {
    return fetchFromCF<CFUser[]>("/user.info", { handles: handles.join(";") });
  },

  /**
   * Returns rating history of the specified user.
   * @param handle User handle.
   */
  async getUserRating(handle: string): Promise<CFRatingChange[]> {
    return fetchFromCF<CFRatingChange[]>("/user.rating", { handle });
  },

  /**
   * Returns submissions of specified user.
   * @param handle User handle.
   * @param from 1-based index of the first submission to return.
   * @param count Number of submissions to return.
   */
  async getUserStatus(handle: string, from: number = 1, count?: number): Promise<CFSubmission[]> {
    const params: Record<string, string | number> = { handle, from };
    if (count) params.count = count;
    return fetchFromCF<CFSubmission[]>("/user.status", params);
  },

  /**
   * Returns all problems.
   * @param tags Semicolon-separated list of tags.
   * @param problemsetName Optional problemset name.
   */
  async getProblems(tags?: string[], problemsetName?: string): Promise<{ problems: CFProblem[] }> {
    const params: Record<string, string | number> = {};
    if (tags) params.tags = tags.join(";");
    if (problemsetName) params.problemsetName = problemsetName;
    
    // Note: getProblems returns an object with { problems, problemStatistics }
    return fetchFromCF<{ problems: CFProblem[] }>("/problemset.problems", params);
  },

  /**
   * Returns list of contests.
   * @param gym If true —- entries from gym contest are returned.
   */
  async getContestList(gym: boolean = false): Promise<CFContest[]> {
    return fetchFromCF<CFContest[]>("/contest.list", { gym: gym.toString() });
  }
};
