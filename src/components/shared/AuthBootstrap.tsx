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

    // Check if we already have an active handle
    const current = localStorage.getItem("cflytics_active_handle");

    // If empty, OR if it's the first time connecting in this session (can be inferred if it was just guest)
    // we set it to the authenticated user's handle.
    if (!current) {
      localStorage.setItem("cflytics_active_handle", user.handle);
      window.dispatchEvent(new Event('storage'));
    }
  }, [status, user?.handle]);

  return null;
}

