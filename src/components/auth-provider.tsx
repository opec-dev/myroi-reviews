"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ConvexProvider, ConvexProviderWithAuth, ConvexReactClient, useConvexAuth } from "convex/react";

export function AppAuthProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  return enabled ? <ConnectedProviders>{children}</ConnectedProviders> : <PublicConvexProvider>{children}</PublicConvexProvider>;
}

function PublicConvexProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

function ConnectedProviders({ children }: { children: ReactNode }) {
  const [convex] = useState(() => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!));
  return <AuthKitProvider><ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}><AccountBootstrap>{children}</AccountBootstrap></ConvexProviderWithAuth></AuthKitProvider>;
}

function AccountBootstrap({children}:{children:ReactNode}){
  const {isAuthenticated}=useConvexAuth();const started=useRef(false);
  useEffect(()=>{if(!isAuthenticated||started.current)return;started.current=true;void fetch("/api/auth/bootstrap",{method:"POST"}).then(response=>{if(!response.ok)throw new Error("Account provisioning failed")}).catch(()=>{started.current=false})},[isAuthenticated]);
  return children;
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
