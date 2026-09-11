"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AuthKitProvider, useAccessToken, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ConvexProvider, ConvexProviderWithAuth, ConvexReactClient, useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

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
  const {isAuthenticated,isLoading}=useConvexAuth();
  const syncCurrentUser=useMutation(api.accounts.syncCurrentUser);
  const started=useRef(false);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);

  useEffect(()=>{
    if(isLoading)return;
    if(!isAuthenticated){started.current=false;setReady(true);return;}
    if(started.current)return;
    started.current=true;
    setReady(false);
    setFailed(false);
    void syncCurrentUser({})
      .then(()=>setReady(true))
      .catch(()=>{started.current=false;setFailed(true)});
  },[isAuthenticated,isLoading,syncCurrentUser]);

  if(isLoading||!ready){
    return <main className="login-page"><section className="login-card"><h1>{failed?"Account setup failed":"Loading secure dashboard…"}</h1>{failed&&<p>Please sign out and try again. If this continues, contact the platform administrator.</p>}</section></main>;
  }
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
