"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, CheckCircle2, Link2 } from "lucide-react";
import { useAuth } from "@/lib/store/useAuth";
import { toast } from "sonner";
import { guestStorage } from "@/lib/storage/guest";

type Challenge = {
  id: string;
  handle: string;
  token: string;
  expiresAt: string;
};

export default function ConnectPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  const authStatus = useAuth((s) => s.status);
  const authUser = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const logout = useAuth((s) => s.logout);

  const [handle, setHandle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    const fromQuery = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("handle") || ""
      : "";
    const id = setTimeout(() => {
      const saved = localStorage.getItem("codey_active_handle") || "";
      setHandle((prev) => (prev.trim().length > 0 ? prev : (fromQuery || saved)));
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const isConnected = authStatus === "connected" && !!authUser;
  const canRequest = useMemo(() => handle.trim().length > 0 && !loading, [handle, loading]);

  const requestChallenge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create challenge");
      const data = await res.json();
      setChallenge(data.challenge);
      toast.success("Verification token created");
    } catch {
      toast.error("Could not create verification token");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!challenge) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Verification failed");
      }

      // Refresh session (becomes connected)
      await refresh();

      // Optional: sync guest data for this handle into the connected account
      const sourceHandle = handle.trim();
      const guestBookmarks = sourceHandle ? guestStorage.bookmarks.list(sourceHandle) : [];
      const guestNotes = sourceHandle ? guestStorage.notes.list(sourceHandle) : [];
      const guestGoals = sourceHandle ? guestStorage.goals.list(sourceHandle) : [];

      const hasGuestData =
        guestBookmarks.length > 0 || guestNotes.length > 0 || guestGoals.length > 0;

      if (hasGuestData) {
        const syncRes = await fetch("/api/sync/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookmarks: guestBookmarks,
            notes: guestNotes,
            goals: guestGoals,
          }),
        });

        if (syncRes.ok) {
          guestStorage.bookmarks.clear(sourceHandle);
          guestStorage.notes.clear(sourceHandle);
          guestStorage.goals.clear(sourceHandle);
          toast.success("Connected + synced local data");
        } else {
          toast.success("Connected (local data not synced)");
        }
      } else {
        toast.success("Connected successfully");
      }

      router.push("/dashboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const copyToken = async () => {
    if (!challenge?.token) return;
    await navigator.clipboard.writeText(challenge.token);
    toast.success("Copied");
  };

  if (authStatus === "loading") {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="py-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold">Signed in as</div>
                <div className="text-2xl font-black tracking-tight">@{authUser.handle}</div>
              </div>
              <Badge variant="outline" className="font-bold">Synced</Badge>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => router.push("/dashboard")} className="font-bold">
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="font-bold"
                onClick={async () => {
                  await logout();
                  toast.success("Logged out");
                  router.push("/");
                }}
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Connect your Codeforces handle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Guest mode works without login. Connecting lets you <b>sync bookmarks, notes, and goals</b> across devices.
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Step 1 — Enter your handle
            </div>
            <div className="flex gap-2">
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. tourist"
                className="h-11"
              />
              <Button
                onClick={requestChallenge}
                disabled={!canRequest}
                className="h-11 font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Token"}
              </Button>
            </div>
          </div>

          {challenge && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Step 2 — Put this into your Codeforces profile “Organization”
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-3">
                  <code className="text-sm font-mono font-bold break-all">{challenge.token}</code>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={copyToken}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Edit here:{" "}
                  <Link
                    href="https://codeforces.com/settings/social"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary inline-flex items-center gap-1"
                  >
                    Codeforces settings <Link2 className="h-3 w-3" />
                  </Link>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Token expires at <b>{new Date(challenge.expiresAt).toLocaleTimeString()}</b>.
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={verify}
                  disabled={verifying}
                  className="font-bold"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    "Verify & Connect"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="font-bold"
                  onClick={() => setChallenge(null)}
                >
                  Restart
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

