"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const defaults = {
  popupEnabled: true,
  popupPosition: "left" as "left" | "right",
  firstDelaySeconds: 10,
  rotationSeconds: 15,
  minimumRating: 4,
  wallEnabled: true,
  wallPageSize: 9,
  wallBackgroundColor: "#f7f8fb",
  showReviewDates: true,
};

export function EmbedDisplaySettings({ businessId }: { businessId: Id<"businesses"> }) {
  const stored = useQuery(api.embeds.forBusiness, { businessId });
  const saveSettings = useMutation(api.embeds.save);
  const [settings, setSettings] = useState(defaults);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!stored) return;
    setSettings({
      popupEnabled: stored.popupEnabled,
      popupPosition: stored.popupPosition,
      firstDelaySeconds: stored.firstDelaySeconds,
      rotationSeconds: stored.rotationSeconds,
      minimumRating: stored.minimumRating,
      wallEnabled: stored.wallEnabled,
      wallPageSize: stored.wallPageSize,
      wallBackgroundColor: stored.wallBackgroundColor || defaults.wallBackgroundColor,
      showReviewDates: stored.showReviewDates ?? true,
    });
  }, [stored]);
  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await saveSettings({ businessId, ...settings });
      setMessage("Review wall and popup display settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Display settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="embed-display-settings">
      <h3>Wall & popup appearance</h3>
      <p>These settings update the live wall and the small rotating review popup.</p>
      <div className="settings-grid compact-settings">
        <label>
          Wall background
          <input type="color" value={settings.wallBackgroundColor} onChange={event => setSettings({ ...settings, wallBackgroundColor: event.target.value })} />
        </label>
        <label>
          Popup interval (seconds)
          <input type="number" min="5" max="300" value={settings.rotationSeconds} onChange={event => setSettings({ ...settings, rotationSeconds: Number(event.target.value) })} />
        </label>
        <label>
          Popup position
          <select value={settings.popupPosition} onChange={event => setSettings({ ...settings, popupPosition: event.target.value as "left" | "right" })}>
            <option value="left">Bottom left</option>
            <option value="right">Bottom right</option>
          </select>
        </label>
      </div>
      <label className="check-row"><input type="checkbox" checked={settings.showReviewDates} onChange={event => setSettings({ ...settings, showReviewDates: event.target.checked })} /> Show review dates on the wall</label>
      <div className="settings-save">
        <small>{message || "Provider icons come from Review sites and stay consistent everywhere."}</small>
        <button className="button primary" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save display settings"}</button>
      </div>
    </div>
  );
}
