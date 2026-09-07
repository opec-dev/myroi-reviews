"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Client = { id: string; business: string; email: string; status: "Active" | "Invited" };
const pilotClients: Client[] = [{ id: "yorkshire", business: "Yorkshire Roofing", email: "opecora@sicconsulting.com", status: "Active" }];

export function AdminClients({ connected = false }: { connected?: boolean }) {
  return connected ? <ConnectedAdminClients /> : <PilotAdminClients />;
}

function ClientTable({ clients }: { clients: Client[] }) {
  return <div className="client-table">
    <div className="client-row client-head"><span>Business</span><span>Owner login</span><span>Status</span><span /></div>
    {clients.map(client => <div className="client-row" key={client.id}><strong>{client.business}</strong><span>{client.email}</span><span className={client.status === "Active" ? "enabled" : "invited"}>{client.status}</span><a href={client.id === "yorkshire" ? "/" : "#"}>Manage</a></div>)}
  </div>;
}

function PilotAdminClients() {
  const [clients, setClients] = useState(pilotClients);
  const [open, setOpen] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setClients(current => [...current, { id: String(Date.now()), business: String(form.get("business")), email: String(form.get("email")), status: "Invited" }]);
    setOpen(false);
  }
  return <AdminClientsView clients={clients} open={open} setOpen={setOpen} onSubmit={submit} pilot />;
}

function ConnectedAdminClients() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const syncCurrentUser = useMutation(api.accounts.syncCurrentUser);
  const recordInvitation = useMutation(api.accounts.recordInvitation);
  const synced = useRef(false);
  const currentUser = useQuery(api.accounts.current, isAuthenticated ? {} : "skip");
  const data = useQuery(api.accounts.listClients, currentUser?.isPlatformAdmin ? {} : "skip");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || synced.current) return;
    synced.current = true;
    void syncCurrentUser().catch(() => { synced.current = false; });
  }, [isAuthenticated, syncCurrentUser]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const businessName = String(form.get("business"));
    const email = String(form.get("email"));
    try {
      const response = await fetch("/api/admin/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ businessName, email }) });
      const result = await response.json() as { invitationId?: string; error?: string };
      if (!response.ok || !result.invitationId) throw new Error(result.error ?? "Invitation failed.");
      await recordInvitation({ businessName, email, workosInvitationId: result.invitationId });
      setOpen(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Invitation failed."); }
    finally { setSubmitting(false); }
  }

  if (isLoading || currentUser === undefined) return <div className="empty-state">Loading secure administrator workspace…</div>;
  if (!currentUser?.isPlatformAdmin) return <div className="form-error">This account does not have platform-administrator access.</div>;
  const clients: Client[] = data ? [
    ...data.businesses.map(business => ({ id: business._id, business: business.name, email: "Client owner", status: "Active" as const })),
    ...data.invitations.filter(invitation => invitation.status === "pending").map(invitation => ({ id: invitation._id, business: invitation.businessName, email: invitation.email, status: "Invited" as const })),
  ] : [];
  return <AdminClientsView clients={clients} open={open} setOpen={setOpen} onSubmit={submit} error={error} submitting={submitting} />;
}

function AdminClientsView({ clients, open, setOpen, onSubmit, error = "", submitting = false, pilot = false }: {
  clients: Client[]; open: boolean; setOpen: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error?: string; submitting?: boolean; pilot?: boolean;
}) {
  return <>
    <div className="section-heading"><div><span className="eyebrow">Platform administration</span><h2>Client accounts</h2></div><button className="button primary" onClick={() => setOpen(true)}>+ Invite client</button></div>
    <ClientTable clients={clients} />
    {pilot && <small className="pilot-note">This public pilot demonstrates the workflow. WorkOS sends the real invitation after production credentials are activated.</small>}
    {open && <div className="modal-backdrop"><section className="modal-card"><button className="modal-close" onClick={() => setOpen(false)}>×</button><h2>Create client account</h2><p>The owner receives an invitation and starts with one business and website.</p><form onSubmit={onSubmit}><label>Business name<input name="business" required /></label><label>Owner email<input name="email" type="email" required /></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button" onClick={() => setOpen(false)}>Cancel</button><button className="button primary" disabled={submitting}>{submitting ? "Creating…" : "Create & invite"}</button></div></form></section></div>}
  </>;
}
