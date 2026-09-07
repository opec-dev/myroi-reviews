"use client";

import { ReactNode, useCallback, useState } from "react";
import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";

export function AppAuthProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  if (!enabled) return children;
  return <ConnectedProviders>{children}</ConnectedProviders>;
}

function ConnectedProviders({ children }: { children: ReactNode }) {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));
  return <AuthKitProvider><ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>{children}</ConvexProviderWithAuth></AuthKitProvider>;
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();
  const fetchAccessToken = useCallback(async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}) => {
    if (!user) return null;
    try { return ((forceRefreshToken ? await refresh() : await getAccessToken()) ?? null); }
    catch { return null; }
  }, [user, refresh, getAccessToken]);
  return { isLoading, isAuthenticated: Boolean(user), fetchAccessToken };
}
