import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const dynamic="force-dynamic";

export async function GET(){
  let auth;try{auth=await withAuth({ensureSignedIn:true})}catch{return Response.json({error:"Secure administrator sign-in is required."},{status:401})}
  const admins=(process.env.PLATFORM_ADMIN_EMAILS??"oliver@sicconsulting.com,support-team@myroiagency.com").split(",").map(value=>value.trim().toLowerCase());
  if(!admins.includes(auth.user.email.toLowerCase()))return Response.json({error:"Administrator access required."},{status:403});
  const convexUrl=process.env.NEXT_PUBLIC_CONVEX_URL;if(!convexUrl)return Response.json({error:"Database connection is unavailable."},{status:503});
  const convex=new ConvexHttpClient(convexUrl);convex.setAuth(auth.accessToken);const settings=await convex.query(api.emailSettings.mine,{});
  const missing:string[]=[];
  const method=settings?.primaryDeliveryMethod??(settings?.smtpHost?.includes("mailjet.com")?"mailjet_api":"smtp");
  if(method==="smtp"&&!settings?.smtpHost)missing.push("SMTP host");if(method!=="sendpulse_api"&&!settings?.smtpUser)missing.push(method==="mailjet_api"?"Mailjet API key":"SMTP username");if(!settings?.smtpPasswordConfigured)missing.push(method==="sendpulse_api"?"SendPulse API key":method==="mailjet_api"?"Mailjet API secret":"SMTP password");if(!settings?.fromEmail)missing.push("sender address");if(!settings?.smtpTestRecipient)missing.push("test recipient");
  return Response.json({configured:missing.length===0,missing,smtpHostConfigured:method!=="smtp"||Boolean(settings?.smtpHost),smtpUserConfigured:method==="sendpulse_api"||Boolean(settings?.smtpUser),smtpPasswordConfigured:Boolean(settings?.smtpPasswordConfigured),smtpFromEmailConfigured:Boolean(settings?.fromEmail),smtpTestRecipientConfigured:Boolean(settings?.smtpTestRecipient),alertSmtpPasswordConfigured:Boolean(settings?.alertSmtpPasswordConfigured)},{headers:{"Cache-Control":"no-store"}});
}
