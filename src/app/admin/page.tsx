import { AdminClients } from "@/components/admin-clients";

export default function AdminPage() {
  const connected = Boolean(process.env.WORKOS_CLIENT_ID && process.env.WORKOS_API_KEY && process.env.WORKOS_COOKIE_PASSWORD && process.env.NEXT_PUBLIC_CONVEX_URL);
  return <main className="admin-page">
    <header className="admin-header"><a className="platform-brand compact" href="/"><img src="/brands/myroiagency-logo.png" alt="" /><strong>myROIagency</strong><span>Reviews</span></a><div><strong>Platform administrator</strong><small>support-team@myroiagency.com</small></div></header>
    <div className="admin-content"><span className="eyebrow">myROI Reviews administration</span><h1>Client accounts</h1><p className="lede">Invite client owners and manage each branded review workspace from one place.</p><section className="panel"><AdminClients connected={connected} /></section></div>
  </main>;
}
