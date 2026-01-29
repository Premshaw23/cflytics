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
