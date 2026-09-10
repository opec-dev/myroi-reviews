"use client";

import { ChangeEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { defaultBusinessBranding } from "@/lib/demo-data";

type InitialBranding={logoUrl?:string|null;iconUrl?:string|null;primaryColor:string;secondaryColor?:string};

export function BusinessBrandingSettings({businessId,initial}: {businessId:Id<"businesses">;initial:InitialBranding}) {
  const [branding,setBranding]=useState({logoUrl:initial.logoUrl||defaultBusinessBranding.logoUrl,iconUrl:initial.iconUrl||defaultBusinessBranding.iconUrl,primaryColor:initial.primaryColor,secondaryColor:initial.secondaryColor||"#e63946"});
  const [files,setFiles]=useState<{logo?:File;icon?:File}>({});
  const [message,setMessage]=useState(""); const [saving,setSaving]=useState(false);
  const generateUploadUrl=useMutation(api.businesses.generateUploadUrl); const saveBranding=useMutation(api.businesses.saveBranding);
  function upload(key:"logo"|"icon",event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];if(!file)return;setFiles(current=>({...current,[key]:file}));const reader=new FileReader();reader.onload=()=>setBranding(current=>({...current,[`${key}Url`]:String(reader.result)}));reader.readAsDataURL(file);setMessage("");}
  async function store(file?:File){if(!file)return undefined;const url=await generateUploadUrl({businessId});const response=await fetch(url,{method:"POST",headers:{"Content-Type":file.type},body:file});if(!response.ok)throw new Error("The image upload failed.");return (await response.json() as {storageId:Id<"_storage">}).storageId;}
  async function save(){setSaving(true);setMessage("");try{const[logoStorageId,iconStorageId]=await Promise.all([store(files.logo),store(files.icon)]);await saveBranding({businessId,primaryColor:branding.primaryColor,secondaryColor:branding.secondaryColor,...(logoStorageId?{logoStorageId}:{}),...(iconStorageId?{iconStorageId}:{})});setFiles({});setMessage("Business branding saved to the client account.");}catch(error){setMessage(error instanceof Error?error.message:"Branding could not be saved.");}finally{setSaving(false)}}
  return <><div className="section-heading"><div><span className="eyebrow">Client identity</span><h2>Logo, QR icon & colors</h2></div></div><p className="panel-intro">Use the full logo in the funnel and card. Upload a separate square icon for the center of the QR code and compact spaces.</p><div className="branding-upload-row"><label className="brand-upload"><strong>Main business logo</strong><img src={branding.logoUrl} alt="Main logo preview"/><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={event=>upload("logo",event)}/><small>Wide or horizontal logos work well here.</small></label><label className="brand-upload square"><strong>Square business icon</strong><img src={branding.iconUrl} alt="Square icon preview"/><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={event=>upload("icon",event)}/><small>Used as large as safely possible inside high-correction QR codes.</small></label></div><div className="settings-grid"><label>Primary color<input type="color" value={branding.primaryColor} onChange={event=>setBranding({...branding,primaryColor:event.target.value})}/></label><label>Secondary color<input type="color" value={branding.secondaryColor} onChange={event=>setBranding({...branding,secondaryColor:event.target.value})}/></label></div><div className="settings-save"><small>{message||"The print-card banner and client accents use these colors."}</small><button className="button primary" disabled={saving} onClick={save}>{saving?"Saving…":"Save business branding"}</button></div></>;
}
