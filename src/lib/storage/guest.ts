"use client";

export type GuestBookmark = {
  id: string;
  problemId: string;
  name: string;
  rating: number | null;
  createdAt: string; // ISO
};

export type GuestNote = {
  id: string;
  problemId: string;
  content: string;
  updatedAt: string; // ISO
};

export type GuestGoalType = "RATING" | "PROBLEMS_SOLVED" | "CONTEST_RANK";

export type GuestGoal = {
  id: string;
  type: GuestGoalType;
  target: number;
  current: number;
  deadline: string | null; // ISO
  completed: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeHandle(handle: string) {
  return handle.trim();
}

function key(scope: string, handle: string) {
  return `codey_guest_${scope}:${normalizeHandle(handle) || "anonymous"}`;
}

export const guestStorage = {
  bookmarks: {
    list(handle: string): GuestBookmark[] {
      return safeParse<GuestBookmark[]>(localStorage.getItem(key("bookmarks", handle)), []);
    },
    toggle(handle: string, input: Omit<GuestBookmark, "id" | "createdAt">) {
      const now = new Date().toISOString();
      const items = guestStorage.bookmarks.list(handle);
      const existing = items.find((b) => b.problemId === input.problemId);
      const next = existing
        ? items.filter((b) => b.problemId !== input.problemId)
        : [
            {
              id: `guest_${crypto.randomUUID()}`,
              createdAt: now,
              ...input,
            },
            ...items,
          ];

      localStorage.setItem(key("bookmarks", handle), JSON.stringify(next));
      return { bookmarked: !existing };
    },
    clear(handle: string) {
      localStorage.removeItem(key("bookmarks", handle));
    },
  },

  notes: {
    list(handle: string): GuestNote[] {
      return safeParse<GuestNote[]>(localStorage.getItem(key("notes", handle)), []);
    },
    get(handle: string, problemId: string): GuestNote | null {
      return guestStorage.notes.list(handle).find((n) => n.problemId === problemId) ?? null;
    },
    upsert(handle: string, problemId: string, content: string): GuestNote {
      const now = new Date().toISOString();
      const items = guestStorage.notes.list(handle);
      const existing = items.find((n) => n.problemId === problemId);
      const nextItem: GuestNote = {
        id: existing?.id ?? `guest_${crypto.randomUUID()}`,
        problemId,
        content,
        updatedAt: now,
      };
      const next = [nextItem, ...items.filter((n) => n.problemId !== problemId)];
      localStorage.setItem(key("notes", handle), JSON.stringify(next));
      return nextItem;
    },
    clear(handle: string) {
      localStorage.removeItem(key("notes", handle));
    },
  },

  goals: {
    list(handle: string): GuestGoal[] {
      return safeParse<GuestGoal[]>(localStorage.getItem(key("goals", handle)), []);
    },
    create(
      handle: string,
      input: Pick<GuestGoal, "type" | "target" | "deadline"> & { current?: number }
    ): GuestGoal {
      const now = new Date().toISOString();
      const items = guestStorage.goals.list(handle);
      const goal: GuestGoal = {
        id: `guest_${crypto.randomUUID()}`,
        type: input.type,
        target: input.target,
        current: input.current ?? 0,
        deadline: input.deadline ?? null,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      const next = [goal, ...items];
      localStorage.setItem(key("goals", handle), JSON.stringify(next));
      return goal;
    },
    update(handle: string, id: string, patch: Partial<Pick<GuestGoal, "current" | "completed">>) {
      const now = new Date().toISOString();
      const items = guestStorage.goals.list(handle);
      const next = items.map((g) =>
        g.id === id ? { ...g, ...patch, updatedAt: now } : g
      );
      localStorage.setItem(key("goals", handle), JSON.stringify(next));
      return next.find((g) => g.id === id) ?? null;
    },
    remove(handle: string, id: string) {
      const items = guestStorage.goals.list(handle);
      const next = items.filter((g) => g.id !== id);
      localStorage.setItem(key("goals", handle), JSON.stringify(next));
      return { success: true };
    },
    clear(handle: string) {
      localStorage.removeItem(key("goals", handle));
    },
  },
};

