import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { encryptSmtpSecret } from "@/lib/smtp-secrets";

const schema=z.object({
  primaryDeliveryMethod:z.enum(["smtp","mailjet_api","sendpulse_api"]),smtpHost:z.string().trim().max(255),smtpPort:z.number().int().min(1).max(65535),smtpUser:z.string().trim().max(320),smtpPassword:z.string().max(2048).optional(),
  fromName:z.string().trim().min(1).max(160),fromEmail:z.string().trim().email().max(320),smtpTestRecipient:z.string().trim().email().max(320),notifyEmailFailures:z.boolean(),failureAlertEmail:z.string().trim().email().max(320).or(z.literal("")),
  backupDeliveryMethod:z.enum(["smtp","mailjet_api","sendpulse_api"]),alertSmtpHost:z.string().trim().max(255),alertSmtpPort:z.number().int().min(1).max(65535),alertSmtpUser:z.string().trim().max(320),alertSmtpPassword:z.string().max(2048).optional(),alertFromEmail:z.string().trim().email().max(320).or(z.literal("")),
});

export async function POST(request:Request){
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Cross-site SMTP updates are not allowed."},{status:403});
  let auth;
  try{auth=await withAuth({ensureSignedIn:true})}catch{return NextResponse.json({error:"Secure administrator sign-in is required."},{status:401})}
  const admins=(process.env.PLATFORM_ADMIN_EMAILS??"oliver@sicconsulting.com,support-team@myroiagency.com").split(",").map(value=>value.trim().toLowerCase());
  if(!admins.includes(auth.user.email.toLowerCase()))return NextResponse.json({error:"Administrator access required."},{status:403});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Enter a valid provider, sender, and test-recipient configuration."},{status:400});
  if(parsed.data.primaryDeliveryMethod!=="sendpulse_api"&&(!parsed.data.smtpHost||!parsed.data.smtpUser))return NextResponse.json({error:"The primary SMTP/Mailjet provider needs a host and username or API key."},{status:400});
  const backupStarted=Boolean(parsed.data.alertFromEmail||parsed.data.alertSmtpHost||parsed.data.alertSmtpUser||parsed.data.alertSmtpPassword);
  if(backupStarted&&!parsed.data.alertFromEmail)return NextResponse.json({error:"The backup provider needs a verified sender email."},{status:400});
  if(backupStarted&&parsed.data.backupDeliveryMethod!=="sendpulse_api"&&(!parsed.data.alertSmtpHost||!parsed.data.alertSmtpUser))return NextResponse.json({error:"The backup SMTP/Mailjet provider needs a host and username or API key."},{status:400});
  if(!process.env.SMTP_CREDENTIAL_ENCRYPTION_KEY)return NextResponse.json({error:"Secure SMTP storage is not configured on the production host."},{status:503});
  const convexUrl=process.env.NEXT_PUBLIC_CONVEX_URL;
  if(!convexUrl)return NextResponse.json({error:"The database connection is not configured."},{status:503});

  const convex=new ConvexHttpClient(convexUrl);convex.setAuth(auth.accessToken);
  const current=await convex.query(api.emailSettings.mine,{});
  if(!parsed.data.smtpPassword&&!current?.smtpPasswordConfigured)return NextResponse.json({error:"Enter the SMTP password before saving."},{status:400});
  const{smtpPassword,alertSmtpPassword,...values}=parsed.data;
  const smtpPasswordCiphertext=smtpPassword?await encryptSmtpSecret(smtpPassword):undefined;
  const alertSmtpPasswordCiphertext=alertSmtpPassword?await encryptSmtpSecret(alertSmtpPassword):undefined;
  await convex.mutation(api.emailSettings.saveSecure,{...values,...(smtpPasswordCiphertext?{smtpPasswordCiphertext}:{}),...(alertSmtpPasswordCiphertext?{alertSmtpPasswordCiphertext}:{})});
  return NextResponse.json({saved:true,passwordConfigured:Boolean(smtpPasswordCiphertext||current?.smtpPasswordConfigured),alertPasswordConfigured:Boolean(alertSmtpPasswordCiphertext||current?.alertSmtpPasswordConfigured)});
}
