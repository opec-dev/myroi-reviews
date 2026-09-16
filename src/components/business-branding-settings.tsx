"use client";

import { ChangeEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { defaultBusinessBranding } from "@/lib/demo-data";
import type { SocialLink, SocialProvider } from "@/lib/demo-data";

type InitialBranding = {
  logoUrl?: string | null;
  iconUrl?: string | null;
  googleBadgeUrl?: string | null;
  yelpBadgeUrl?: string | null;
  publicReviewPageUrl?: string;
  socialLinks?: SocialLink[];
  primaryColor: string;
  secondaryColor?: string;
};

export function BusinessBrandingSettings({
  businessId,
  initial,
}: {
  businessId: Id<"businesses">;
  initial: InitialBranding;
}) {
  const [branding, setBranding] = useState({
    logoUrl: initial.logoUrl || defaultBusinessBranding.logoUrl,
    iconUrl: initial.iconUrl || defaultBusinessBranding.iconUrl,
    googleBadgeUrl:
      initial.googleBadgeUrl || defaultBusinessBranding.googleBadgeUrl!,
    yelpBadgeUrl: initial.yelpBadgeUrl || defaultBusinessBranding.yelpBadgeUrl!,
    publicReviewPageUrl: initial.publicReviewPageUrl || "",
    socialLinks: initial.socialLinks || [],
    primaryColor: initial.primaryColor,
    secondaryColor: initial.secondaryColor || "#e63946",
  });
  const [files, setFiles] = useState<{
    logo?: File;
    icon?: File;
    googleBadge?: File;
    yelpBadge?: File;
  }>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const generateUploadUrl = useMutation(api.businesses.generateUploadUrl);
  const saveBranding = useMutation(api.businesses.saveBranding);
  function upload(
    key: "logo" | "icon" | "googleBadge" | "yelpBadge",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFiles((current) => ({ ...current, [key]: file }));
    const reader = new FileReader();
    reader.onload = () =>
      setBranding((current) => ({
        ...current,
        [`${key}Url`]: String(reader.result),
      }));
    reader.readAsDataURL(file);
    setMessage("");
  }
  async function store(file?: File) {
    if (!file) return undefined;
    const url = await generateUploadUrl({ businessId });
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("The image upload failed.");
    return ((await response.json()) as { storageId: Id<"_storage"> }).storageId;
  }
  async function save() {
    setSaving(true);
    setMessage("");
    try {
      if (
        branding.publicReviewPageUrl &&
        new URL(branding.publicReviewPageUrl).protocol !== "https:"
      )
        throw new Error("The customer review-page URL must use https://.");
      const [
        logoStorageId,
        iconStorageId,
        googleBadgeStorageId,
        yelpBadgeStorageId,
      ] = await Promise.all([
        store(files.logo),
        store(files.icon),
        store(files.googleBadge),
        store(files.yelpBadge),
      ]);
      await saveBranding({
        businessId,
        publicReviewPageUrl: branding.publicReviewPageUrl || undefined,
        socialLinks: branding.socialLinks.filter((link) => link.url.trim()),
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        ...(logoStorageId ? { logoStorageId } : {}),
        ...(iconStorageId ? { iconStorageId } : {}),
        ...(googleBadgeStorageId ? { googleBadgeStorageId } : {}),
        ...(yelpBadgeStorageId ? { yelpBadgeStorageId } : {}),
      });
      setFiles({});
      setMessage("Business branding and public review destination saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Branding could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">Client identity</span>
          <h2>Logo, QR icon & public display</h2>
        </div>
      </div>
      <p className="panel-intro">
        The square icon is fitted inside the QR code without cropping. The
        Google and Yelp artwork can be replaced per client.
      </p>
      <div className="branding-upload-row">
        <label className="brand-upload">
          <strong>Main business logo</strong>
          <img src={branding.logoUrl} alt="Main logo preview" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => upload("logo", event)}
          />
          <small>Wide or horizontal logos work well here.</small>
        </label>
        <label className="brand-upload square">
          <strong>Square QR icon</strong>
          <img src={branding.iconUrl} alt="Square icon preview" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => upload("icon", event)}
          />
          <small>Centered and contained inside the safe QR area.</small>
        </label>
        <label className="brand-upload badge-upload">
          <strong>Google card logo</strong>
          <img src={branding.googleBadgeUrl} alt="Google badge preview" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => upload("googleBadge", event)}
          />
          <small>Replace the built-in default.</small>
        </label>
        <label className="brand-upload badge-upload">
          <strong>Yelp card logo</strong>
          <img src={branding.yelpBadgeUrl} alt="Yelp badge preview" />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event) => upload("yelpBadge", event)}
          />
          <small>Replace the built-in default.</small>
        </label>
      </div>
      <div className="settings-grid">
        <label>
          Primary color
          <input
            type="color"
            value={branding.primaryColor}
            onChange={(event) =>
              setBranding({ ...branding, primaryColor: event.target.value })
            }
          />
        </label>
        <label>
          Secondary color
          <input
            type="color"
            value={branding.secondaryColor}
            onChange={(event) =>
              setBranding({ ...branding, secondaryColor: event.target.value })
            }
          />
        </label>
        <label className="wide-field">
          Customer-owned review link <span>(optional)</span>
          <input
            type="url"
            placeholder="https://customer-site.com/reviews"
            value={branding.publicReviewPageUrl}
            onChange={(event) =>
              setBranding({
                ...branding,
                publicReviewPageUrl: event.target.value,
              })
            }
          />
          <small>
            Shared links, business-card QR codes, and the popup’s “Read all
            reviews” link use this address. First create this path on the
            customer’s website and redirect it to the client’s hosted review
            funnel, preserving the query string. No CNAME or DNS change is
            needed. Leave blank to use the hosted myROI Reviews URL.
          </small>
        </label>
        <div className="wide-field social-link-editor">
          <strong>
            Social links <span>(optional)</span>
          </strong>
          <small>
            Shown as tappable “Follow us” links after the rating experience.
          </small>
          {branding.socialLinks.map((link, index) => (
            <div className="social-link-row" key={`${link.provider}-${index}`}>
              <select
                value={link.provider}
                onChange={(event) =>
                  setBranding({
                    ...branding,
                    socialLinks: branding.socialLinks.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            provider: event.target.value as SocialProvider,
                          }
                        : item,
                    ),
                  })
                }
              >
                {[
                  "facebook",
                  "instagram",
                  "x",
                  "tiktok",
                  "youtube",
                  "linkedin",
                  "website",
                ].map((provider) => (
                  <option value={provider} key={provider}>
                    {provider === "x"
                      ? "X"
                      : provider[0].toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="https://…"
                value={link.url}
                onChange={(event) =>
                  setBranding({
                    ...branding,
                    socialLinks: branding.socialLinks.map((item, i) =>
                      i === index ? { ...item, url: event.target.value } : item,
                    ),
                  })
                }
              />
              <button
                className="small-action"
                type="button"
                onClick={() =>
                  setBranding({
                    ...branding,
                    socialLinks: branding.socialLinks.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="button"
            type="button"
            onClick={() =>
              setBranding({
                ...branding,
                socialLinks: [
                  ...branding.socialLinks,
                  { provider: "facebook", url: "" },
                ],
              })
            }
          >
            + Add social link
          </button>
        </div>
      </div>
      <div className="settings-save">
        <small>
          {message ||
            "The print-card banner and client accents use these colors."}
        </small>
        <button className="button primary" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save business branding"}
        </button>
      </div>
    </>
  );
}
