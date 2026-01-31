export * from "./codeforces";

export interface ApiResponse<T> {
  status: "OK" | "FAILED";
  result?: T;
  comment?: string;
}

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
}

export enum GoalType {
  RATING = "RATING",
  PROBLEMS_SOLVED = "PROBLEMS_SOLVED",
  CONTEST_RANK = "CONTEST_RANK",
}

export interface Goal {
  id: string;
  userId: string;
  type: GoalType | string;
  target: number;
  current: number;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
