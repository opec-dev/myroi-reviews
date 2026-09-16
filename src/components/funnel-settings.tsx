"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { defaultFunnelSettings, FunnelSettings } from "@/lib/demo-data";

type PreviewStage = "rating" | "positive" | "recovery" | "complete";

export function FunnelSettingsEditor({
  businessId,
  business,
}: {
  businessId: Id<"businesses">;
  business: { name: string; slug: string; logoUrl?: string | null };
}) {
  const stored = useQuery(api.funnel.forBusiness, { businessId });
  const saveSettings = useMutation(api.funnel.saveSettings);
  const [settings, setSettings] = useState(defaultFunnelSettings);
  const [stage, setStage] = useState<PreviewStage>("rating");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  useEffect(() => {
    if (!stored) return;
    const {
      _id: _idIgnored,
      _creationTime: _createdIgnored,
      businessId: _businessIgnored,
      ...savedSettings
    } = stored;
    setSettings({ ...defaultFunnelSettings, ...savedSettings });
  }, [stored]);
  function change(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const key = event.target.name as keyof FunnelSettings;
    const value =
      event.target instanceof HTMLInputElement &&
      event.target.type === "checkbox"
        ? event.target.checked
        : key === "positiveThreshold"
          ? Number(event.target.value)
          : event.target.value;
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setSaveMessage("");
  }
  async function save() {
    setSaving(true);
    setSaved(false);
    setSaveMessage("");
    try {
      await saveSettings({ businessId, ...settings });
      setSaved(true);
      setSaveMessage("Funnel settings saved.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Funnel settings could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Good and recovery paths</span>
          <h2>Review funnel editor</h2>
        </div>
        <a className="button" href={`/r/${business.slug}`} target="_blank">
          Open full funnel
        </a>
      </div>
      <p className="panel-intro">
        Each section controls one customer-facing step. Use the live preview to
        confirm the wording before saving.
      </p>
      <div className="editor-preview-layout">
        <div className="funnel-editor-sections">
          <EditorSection
            title="1. Initial rating"
            note="Everyone sees this first. Their star choice determines which path appears next."
            active={stage === "rating"}
            onPreview={() => setStage("rating")}
          >
            <label className="check-row">
              <input
                type="checkbox"
                name="showBusinessName"
                checked={settings.showBusinessName}
                onChange={change}
              />{" "}
              Show business name below logo
            </label>
            <label>
              Rating icon
              <select
                name="ratingIcon"
                value={settings.ratingIcon}
                onChange={change}
              >
                <option value="star">Stars</option>
                <option value="heart">Hearts</option>
              </select>
            </label>
            <label>
              Rating headline
              <input
                name="ratingHeadline"
                value={settings.ratingHeadline}
                onChange={change}
              />
            </label>
            <label>
              Rating subtext
              <textarea
                name="ratingSubtext"
                value={settings.ratingSubtext}
                onChange={change}
              />
            </label>
            <label>
              Positive-review threshold
              <select
                name="positiveThreshold"
                value={settings.positiveThreshold}
                onChange={change}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option value={n} key={n}>
                    {n}+ {settings.ratingIcon === "heart" ? "hearts" : "stars"}
                  </option>
                ))}
              </select>
            </label>
          </EditorSection>
          <EditorSection
            title="2. Positive experience"
            note="Shown at or above the threshold; sends the customer to enabled review sites."
            active={stage === "positive"}
            onPreview={() => setStage("positive")}
          >
            <label>
              Headline
              <input
                name="positiveHeadline"
                value={settings.positiveHeadline}
                onChange={change}
              />
            </label>
            <label>
              Message
              <textarea
                name="positiveSubtext"
                value={settings.positiveSubtext}
                onChange={change}
              />
            </label>
            <label>
              Maybe-later link
              <input
                name="maybeLaterText"
                value={settings.maybeLaterText}
                onChange={change}
              />
            </label>
          </EditorSection>
          <EditorSection
            title="3. Private recovery"
            note="Shown below the threshold. This feedback is private and can trigger an email notification."
            active={stage === "recovery"}
            onPreview={() => setStage("recovery")}
            tone="recovery"
          >
            <label>
              Recovery headline
              <input
                name="recoveryHeadline"
                value={settings.recoveryHeadline}
                onChange={change}
              />
            </label>
            <label>
              Recovery message
              <textarea
                name="recoverySubtext"
                value={settings.recoverySubtext}
                onChange={change}
              />
            </label>
            <label>
              Name field
              <input
                name="nameLabel"
                value={settings.nameLabel}
                onChange={change}
              />
            </label>
            <label>
              Contact field
              <input
                name="contactLabel"
                value={settings.contactLabel}
                onChange={change}
              />
            </label>
            <label>
              Feedback field
              <input
                name="messageLabel"
                value={settings.messageLabel}
                onChange={change}
              />
            </label>
            <label>
              Submit button
              <input
                name="submitText"
                value={settings.submitText}
                onChange={change}
              />
            </label>
            <label>
              Public-review fallback
              <input
                name="publicLinkText"
                value={settings.publicLinkText}
                onChange={change}
              />
            </label>
          </EditorSection>
          <EditorSection
            title="4. Completion"
            note="Shown after private feedback or when the customer chooses “Maybe later.”"
            active={stage === "complete"}
            onPreview={() => setStage("complete")}
          >
            <label>
              Completion headline
              <input
                name="completionHeadline"
                value={settings.completionHeadline}
                onChange={change}
              />
            </label>
            <label>
              Completion message
              <textarea
                name="completionSubtext"
                value={settings.completionSubtext}
                onChange={change}
              />
            </label>
          </EditorSection>
        </div>
        <FunnelMiniPreview
          settings={settings}
          stage={stage}
          business={business}
        />
      </div>
      <div className="compliance-note">
        <strong>Compliant by design.</strong> Unhappy customers are offered
        private feedback, but the public review link is never hidden —
        supporting compliance with Google and FTC guidance.
      </div>
      <div className="settings-save">
        <small className={saveMessage && !saved ? "save-error" : ""}>
          {saveMessage || "Every line can be customized per client."}
        </small>
        <button
          className="button primary"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save funnel settings"}
        </button>
      </div>
    </>
  );
}

function EditorSection({
  title,
  note,
  active,
  onPreview,
  tone,
  children,
}: {
  title: string;
  note: string;
  active: boolean;
  onPreview: () => void;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`editor-section ${active ? "active" : ""} ${tone ?? ""}`}
    >
      <div className="editor-section-head">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        <button className="small-action text-action" onClick={onPreview}>
          Preview
        </button>
      </div>
      <div className="settings-grid">{children}</div>
    </section>
  );
}

function FunnelMiniPreview({
  settings,
  stage,
  business,
}: {
  settings: FunnelSettings;
  stage: PreviewStage;
  business: { name: string; logoUrl?: string | null };
}) {
  const symbol = settings.ratingIcon === "heart" ? "♥" : "★";
  return (
    <aside className="live-preview-sticky">
      <span className="eyebrow">Live funnel preview</span>
      <div className="mini-funnel">
        <img src={business.logoUrl || "/brands/yorkshire-roofing.png"} alt="" />
        {settings.showBusinessName && <strong>{business.name}</strong>}
        {stage === "rating" && (
          <>
            <h3>{settings.ratingHeadline}</h3>
            <p>{settings.ratingSubtext}</p>
            <div className="mini-stars">{symbol.repeat(5)}</div>
            <small>Tap a {settings.ratingIcon} to rate your experience</small>
          </>
        )}
        {stage === "positive" && (
          <>
            <span className="preview-mark">♥</span>
            <h3>{settings.positiveHeadline}</h3>
            <p>{settings.positiveSubtext}</p>
            <button>Review us on Google</button>
            <button>Review us on Yelp</button>
            <small>{settings.maybeLaterText}</small>
          </>
        )}
        {stage === "recovery" && (
          <>
            <h3>{settings.recoveryHeadline}</h3>
            <p>{settings.recoverySubtext}</p>
            <input readOnly placeholder={settings.nameLabel} />
            <input readOnly placeholder={settings.contactLabel} />
            <textarea readOnly placeholder={settings.messageLabel} />
            <button>{settings.submitText}</button>
            <small>{settings.publicLinkText}</small>
          </>
        )}
        {stage === "complete" && (
          <>
            <span className="preview-mark">✓</span>
            <h3>{settings.completionHeadline}</h3>
            <p>{settings.completionSubtext}</p>
          </>
        )}
      </div>
    </aside>
  );
}
