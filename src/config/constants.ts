export const CF_API_BASE_URL = "https://codeforces.com/api";

export const RATING_LEVELS = {
  NEWBIE: { name: "Newbie", min: 0, max: 1199, color: "cf-gray" },
  PUPIL: { name: "Pupil", min: 1200, max: 1399, color: "cf-green" },
  SPECIALIST: { name: "Specialist", min: 1400, max: 1599, color: "cf-cyan" },
  EXPERT: { name: "Expert", min: 1600, max: 1899, color: "cf-blue" },
  CANDIDATE_MASTER: { name: "Candidate Master", min: 1900, max: 2099, color: "cf-violet" },
  MASTER: { name: "Master", min: 2100, max: 2299, color: "cf-orange" },
  INTERNATIONAL_MASTER: { name: "International Master", min: 2300, max: 2399, color: "cf-orange" },
  GRANDMASTER: { name: "Grandmaster", min: 2400, max: 2599, color: "cf-red" },
  INTERNATIONAL_GRANDMASTER: { name: "International Grandmaster", min: 2600, max: 2999, color: "cf-red" },
  LEGENDARY_GRANDMASTER: { name: "Legendary Grandmaster", min: 3000, max: 9999, color: "cf-red" },
};

export const CACHE_TTL = {
  USER_INFO: 3600, // 1 hour
  USER_STATUS: 1800, // 30 mins
  USER_RATING: 3600,
  PROBLEMS: 86400, // 24 hours
  CONTESTS: 3600,
};

export const CF_TAGS = [
  "implementation", "math", "greedy", "dp", "data structures", 
  "brute force", "constructive algorithms", "graphs", "sortings", 
  "binary search", "dfs and similar", "strings", "number theory", 
  "trees", "combinatorics", "two pointers", "geometry", "bitmasks", 
  "dsu", "probabilities", "shortest paths", "hashing", "divide and conquer", 
  "games", "flows", "matrices", "expression parsing", "string suffix structures", 
  "meet-in-the-middle", "fft", "ternary search"
];

