"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { pilotClientsStorageKey } from "@/lib/demo-data";
import { recordPilotEmail } from "@/lib/pilot-tracking";

type Client = {
  id: string;
  business: string;
  email: string;
  status: "Active" | "Invited" | "Setup";
  workspaceHref?: string;
  workosInvitationId?: string;
  invitationState?: "sent" | "failed" | "not_sent";
  invitationNote?: string;
};

const pilotClients: Client[] = [{ id: "yorkshire", business: "Yorkshire Roofing", email: "opecora@sicconsulting.com", status: "Active", workspaceHref: "/client/yorkshire-roofing/" }];

export function AdminClients({ connected = false }: { connected?: boolean }) {
  return connected ? <ConnectedAdminClients /> : <PilotAdminClients />;
}

function ClientTable({ clients, busyId, onResend, onSetup, onRemove }: {
  clients: Client[];
  busyId?: string;
  onResend?: (client: Client) => void;
  onSetup?: (client: Client) => void;
  onRemove?: (client: Client) => void;
}) {
  return <div className="client-table">
    <div className="client-row client-head"><span>Business</span><span>Owner login</span><span>Status</span><span>Actions</span></div>
    {clients.map(client => <div className="client-row" key={client.id}>
      <strong>{client.business}</strong>
      <span>{client.email}</span>
      <span><b className={client.status === "Active" ? "enabled" : client.status === "Invited" ? "invited" : "setup-status"}>{client.status}</b>{client.invitationState && <small className={`invite-delivery ${client.invitationState}`}>{client.invitationState === "sent" ? "Email sent" : client.invitationState === "failed" ? "Email failed" : "Email not sent"}</small>}</span>
      <span className="client-actions">
        {client.workspaceHref && <a href={client.workspaceHref}>Manage</a>}
        {client.status === "Invited" && onResend && <button disabled={busyId === client.id} onClick={() => onResend(client)}>{busyId === client.id ? "Sending…" : "Resend invite"}</button>}
        {client.status !== "Active" && onSetup && <button disabled={busyId === client.id} onClick={() => onSetup(client)}>Set up for client</button>}
        {client.status !== "Active" && onRemove && <button className="danger-link" disabled={busyId === client.id} onClick={() => onRemove(client)}>Remove</button>}
      </span>
      {client.invitationNote && <small className="client-row-note">{client.invitationNote}</small>}
    </div>)}
  </div>;
}

function PilotAdminClients() {
  const [clients, setClients] = useState(pilotClients);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const value = localStorage.getItem(pilotClientsStorageKey);
    if (!value) return;
    try {
      const saved = (JSON.parse(value) as Client[]).map(client => client.status === "Invited" && !client.invitationState ? { ...client, invitationState: "not_sent" as const, invitationNote: "This pilot record has no confirmed email delivery." } : client);
      setClients(saved.some(client => client.id === "yorkshire") ? saved : [...pilotClients, ...saved]);
    } catch {}
  }, []);

  function saveClients(next: Client[]) {
    setClients(next);
    localStorage.setItem(pilotClientsStorageKey, JSON.stringify(next));
    window.dispatchEvent(new Event("myroi-clients-updated"));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sendInvite = form.get("sendInvite") === "on";
    const client: Client = { id: crypto.randomUUID(), business: String(form.get("business")), email: String(form.get("email")), status: sendInvite ? "Invited" : "Setup", invitationState: sendInvite ? "not_sent" : undefined, invitationNote: sendInvite ? "Invitation created; delivery has not yet been confirmed." : "Account saved for administrator setup without emailing the client." };
    const next = [...clients, client];
    saveClients(next);
    setOpen(false);
    setMessage(sendInvite ? "Invitation saved. Delivery is being attempted now." : "Client setup saved without sending email.");
    if (sendInvite) await resend(client, next);
  }

  async function resend(client: Client, source = clients) {
    setBusyId(client.id); setMessage("");
    try {
      const response = await fetch("/api/admin/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: client.workosInvitationId ? "resend" : "send", invitationId: client.workosInvitationId, businessName: client.business, email: client.email }) });
      const result = await response.json().catch(() => ({})) as { invitationId?: string; error?: string };
      if (!response.ok || !result.invitationId) throw new Error(result.error ?? "Invitation delivery was not confirmed.");
      saveClients(source.map(row => row.id === client.id ? { ...row, workosInvitationId: result.invitationId, invitationState: "sent" as const, invitationNote: `Invitation emailed ${new Date().toLocaleString()}.` } : row));
      setMessage(`Invitation sent to ${client.email}.`);
      recordPilotEmail({ kind: "invitation", status: "sent", recipient: client.email, subject: `Set up ${client.business}` });
    } catch (error) {
      const problem = error instanceof Error ? error.message : "Invitation delivery failed.";
      saveClients(source.map(row => row.id === client.id ? { ...row, invitationState: "failed" as const, invitationNote: problem } : row));
      setMessage(problem);
      recordPilotEmail({ kind: "invitation", status: "failed", recipient: client.email, subject: `Set up ${client.business}`, error: problem });
    } finally { setBusyId(""); }
  }

  function setup(client: Client) {
    saveClients(clients.map(row => row.id === client.id ? { ...row, status: "Setup", invitationNote: "Administrator-managed setup; no client email is required." } : row));
    setMessage(`${client.business} is now ready for administrator-managed setup.`);
  }

  function remove(client: Client) {
    if (!window.confirm(`Remove the pending ${client.business} account?`)) return;
    saveClients(clients.filter(row => row.id !== client.id));
    setMessage(`${client.business} was removed.`);
  }

  return <AdminClientsView clients={clients} open={open} setOpen={setOpen} onSubmit={submit} busyId={busyId} message={message} onResend={resend} onSetup={setup} onRemove={remove} pilot />;
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

  useEffect(() => { if (!isAuthenticated || synced.current) return; synced.current = true; void syncCurrentUser().catch(() => { synced.current = false; }); }, [isAuthenticated, syncCurrentUser]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget); const businessName = String(form.get("business")); const email = String(form.get("email")); const sendInvite = form.get("sendInvite") === "on";
    try {
      let invitationId: string | undefined;
      if (sendInvite) { const response = await fetch("/api/admin/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ businessName, email }) }); const result = await response.json() as { invitationId?: string; error?: string }; if (!response.ok || !result.invitationId) throw new Error(result.error ?? "Invitation failed."); invitationId = result.invitationId; }
      await recordInvitation({ businessName, email, ...(invitationId ? { workosInvitationId: invitationId } : {}) }); setOpen(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Invitation failed."); } finally { setSubmitting(false); }
  }

  if (isLoading || currentUser === undefined) return <div className="empty-state">Loading secure administrator workspace…</div>;
  if (!currentUser?.isPlatformAdmin) return <div className="form-error">This account does not have platform-administrator access.</div>;
  const clients: Client[] = data ? [...data.businesses.map(business => ({ id: business._id, business: business.name, email: "Client owner", status: "Active" as const, workspaceHref: `/client/${business.slug}/` })), ...data.invitations.filter(invitation => invitation.status === "pending").map(invitation => ({ id: invitation._id, business: invitation.businessName, email: invitation.email, status: "Invited" as const, workosInvitationId: invitation.workosInvitationId, invitationState: invitation.workosInvitationId ? "sent" as const : "not_sent" as const }))] : [];
  return <AdminClientsView clients={clients} open={open} setOpen={setOpen} onSubmit={submit} error={error} submitting={submitting} />;
}

function AdminClientsView({ clients, open, setOpen, onSubmit, error = "", submitting = false, busyId, message, onResend, onSetup, onRemove, pilot = false }: {
  clients: Client[]; open: boolean; setOpen: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; error?: string; submitting?: boolean; busyId?: string; message?: string; onResend?: (client: Client) => void; onSetup?: (client: Client) => void; onRemove?: (client: Client) => void; pilot?: boolean;
}) {
  return <>
    <div className="section-heading"><div><span className="eyebrow">Platform administration</span><h2>Client accounts</h2></div><button className="button primary" onClick={() => setOpen(true)}>+ Add client/user</button></div>
    {message && <div className="action-message">{message}</div>}
    <ClientTable clients={clients} busyId={busyId} onResend={onResend} onSetup={onSetup} onRemove={onRemove} />
    {pilot && <small className="pilot-note">Accounts are saved in this browser during the pilot. An email is only marked sent after the secure WorkOS invitation service confirms delivery.</small>}
    {open && <div className="modal-backdrop"><section className="modal-card"><button className="modal-close" onClick={() => setOpen(false)}>×</button><h2>Create client account</h2><p>Create the business and owner login. You can manage setup yourself now and invite the client later.</p><form onSubmit={onSubmit}><label>Business name<input name="business" required /></label><label>Owner/login email<input name="email" type="email" required /></label><label className="check-row"><input name="sendInvite" type="checkbox" /> Email a secure setup invitation now</label><small className="field-help">Leave unchecked to create an administrator-managed setup without emailing the client.</small>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button" onClick={() => setOpen(false)}>Cancel</button><button className="button primary" disabled={submitting}>{submitting ? "Creating…" : "Create account"}</button></div></form></section></div>}
  </>;
}
