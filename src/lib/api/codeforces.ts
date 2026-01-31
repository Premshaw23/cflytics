import crypto from "crypto";
import { CF_API_BASE_URL } from "@/config/constants";
import { 
  CFUser, 
  CFProblem, 
  CFSubmission, 
  CFRatingChange, 
  CFContest,
  ApiResponse 
} from "@/types";

async function fetchFromCF<T>(path: string, params: Record<string, string | number> = {}, retries = 3): Promise<T> {
  const apiKey = process.env.CF_API_KEY;
  const apiSecret = process.env.CF_API_SECRET;
  
  const queryParams = new URL(CF_API_BASE_URL + path).searchParams;
  
  // Add all provided params
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, value.toString());
  });

  if (apiKey && apiSecret) {
    const time = Math.floor(Date.now() / 1000);
    queryParams.append("apiKey", apiKey);
    queryParams.append("time", time.toString());

    // Sorting parameters alphabetically is required for CF API signing
    const sortedParams = Array.from(queryParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const rand = Math.random().toString(36).substring(2, 8);
    const apiSigInput = `${rand}/${path.startsWith("/") ? path.substring(1) : path}?${sortedParams}#${apiSecret}`;
    const hash = crypto.createHash("sha512").update(apiSigInput).digest("hex");
    queryParams.append("apiSig", `${rand}${hash}`);
  }

  const url = `${CF_API_BASE_URL}${path}?${queryParams.toString()}`;
  
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
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
    } catch (error: unknown) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      
      // Don't retry if user not found or bad request
      if (message && (
        message.includes("not found") || 
        message.includes("handle: User") || 
        message.includes("handles: User")
      )) {
        throw error;
      }

      console.warn(`Attempt ${i + 1} failed for ${path}:`, message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  console.error(`Error fetching from CF after ${retries} attempts (${path}):`, lastError);
  throw lastError;
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
  },

  /**
   * Returns information about a contest and its problems (and optionally standings).
   * @param contestId Id of the contest.
   * @param from 1-based index of the standings row to start from.
   * @param count Number of standing rows to return.
   * @param showUnofficial Whether to show unofficial participants.
   */
  async getContestStandings(
    contestId: number, 
    from: number = 1, 
    count: number = 5, 
    showUnofficial: boolean = false
  ): Promise<{ contest: CFContest, problems: CFProblem[], rows: any[] }> {
    return fetchFromCF<{ contest: CFContest, problems: CFProblem[], rows: any[] }>("/contest.standings", {
      contestId,
      from,
      count,
      showUnofficial: showUnofficial.toString()
    });
  }
};
