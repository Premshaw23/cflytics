"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/store/useAuth";

export function AuthBootstrap() {
  const refresh = useAuth((s) => s.refresh);
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== "connected" || !user?.handle) return;
    // Keep existing "active handle" behavior consistent across the app
    localStorage.setItem("codey_active_handle", user.handle);
  }, [status, user?.handle]);

  return null;
}

