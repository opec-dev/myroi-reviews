"use client";

import { FormEvent, useEffect, useState } from "react";
import { destinationStorageKey, ReviewDestination, ReviewProvider, reviewPlatformCatalog } from "@/lib/demo-data";

type Draft = { id?: string; provider: ReviewProvider; name: string; reviewUrl: string; profileUrl: string };
const emptyDraft: Draft = { provider: "google", name: "Google", reviewUrl: "", profileUrl: "" };

function isHttpsUrl(value: string) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function DestinationManager({ initialDestinations }: { initialDestinations: ReviewDestination[] }) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(destinationStorageKey);
    if (!saved) return;
    try { setDestinations(JSON.parse(saved) as ReviewDestination[]); }
    catch { localStorage.removeItem(destinationStorageKey); }
  }, []);

  function persist(next: ReviewDestination[]) {
    setDestinations(next);
    localStorage.setItem(destinationStorageKey, JSON.stringify(next));
    window.dispatchEvent(new Event("myroi:destinations-updated"));
  }

  function openNew() { setDraft(emptyDraft); setError(""); setModalOpen(true); }
  function openEdit(item: ReviewDestination) {
    setDraft({ id: item.id, provider: item.provider, name: item.name, reviewUrl: item.reviewUrl, profileUrl: item.profileUrl ?? "" });
    setError(""); setModalOpen(true);
  }
  function changeProvider(provider: ReviewProvider) {
    const platform = reviewPlatformCatalog.find((item) => item.provider === provider)!;
    setDraft((current) => ({ ...current, provider, name: platform.name }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isHttpsUrl(draft.reviewUrl) || (draft.profileUrl && !isHttpsUrl(draft.profileUrl))) {
      setError("Please enter complete https:// links."); return;
    }
    if (draft.provider === "custom" && !draft.name.trim()) { setError("Please name the custom review site."); return; }
    const platform = reviewPlatformCatalog.find((item) => item.provider === draft.provider)!;
    const destination: ReviewDestination = {
      id: draft.id ?? `${draft.provider}-${Date.now()}`,
      provider: draft.provider, name: draft.name.trim(), reviewUrl: draft.reviewUrl.trim(),
      profileUrl: draft.profileUrl.trim() || undefined, color: platform.color,
      enabled: draft.id ? destinations.find((item) => item.id === draft.id)?.enabled ?? true : true,
    };
    persist(draft.id ? destinations.map((item) => item.id === draft.id ? destination : item) : [...destinations, destination]);
    setModalOpen(false);
  }
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= destinations.length) return;
    const next = [...destinations]; [next[index], next[target]] = [next[target], next[index]]; persist(next);
  }

  return <>
    <div className="section-heading">
      <div><span className="eyebrow">Where reviews happen</span><h2>Review sites</h2></div>
      <button className="button primary" onClick={openNew}>+ Add platform</button>
    </div>
    <p className="panel-intro">Choose a supported site and keep its write-review link separate from the profile used to read or import reviews.</p>
    <div className="destination-list">
      {destinations.map((destination, index) => <div className="destination" key={destination.id}>
        <span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>
        <div><strong>{destination.name}</strong><small>{destination.reviewUrl}</small></div>
        <div className="destination-actions">
          <button className={`toggle ${destination.enabled ? "on" : ""}`} aria-label={`${destination.enabled ? "Disable" : "Enable"} ${destination.name}`} onClick={() => persist(destinations.map((item) => item.id === destination.id ? { ...item, enabled: !item.enabled } : item))}><span /></button>
          <button className="small-action" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${destination.name} up`}>↑</button>
          <button className="small-action" onClick={() => move(index, 1)} disabled={index === destinations.length - 1} aria-label={`Move ${destination.name} down`}>↓</button>
          <button className="small-action text-action" onClick={() => openEdit(destination)}>Edit</button>
          <button className="small-action danger" onClick={() => persist(destinations.filter((item) => item.id !== destination.id))}>Delete</button>
        </div>
      </div>)}
      {!destinations.length && <div className="empty-state">No review sites yet. Add the first one to publish the review page.</div>}
    </div>
    <small className="pilot-note">Pilot changes are saved in this browser. Convex will sync them to each client login in the connected version.</small>
    {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="platform-dialog-title">
        <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button>
        <h2 id="platform-dialog-title">{draft.id ? "Edit review platform" : "Add a review platform"}</h2>
        <p>Only enable a destination when its first link opens the platform&apos;s review-entry flow.</p>
        <form onSubmit={submit}>
          <label>Platform<select value={draft.provider} onChange={(event) => changeProvider(event.target.value as ReviewProvider)}>{reviewPlatformCatalog.map((platform) => <option key={platform.provider} value={platform.provider}>{platform.name}</option>)}</select></label>
          {draft.provider === "custom" && <label>Platform name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Diamond Certified" /></label>}
          <label>Direct write-review link<input value={draft.reviewUrl} onChange={(event) => setDraft({ ...draft, reviewUrl: event.target.value })} placeholder="https://..." /><small>Where the customer can immediately start writing a review.</small></label>
          <label>Review source/profile URL <span>(optional)</span><input value={draft.profileUrl} onChange={(event) => setDraft({ ...draft, profileUrl: event.target.value })} placeholder="https://..." /><small>Where existing reviews are read or imported from. This can be different.</small></label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions"><button type="button" className="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button primary" type="submit">{draft.id ? "Save changes" : "Add platform"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
