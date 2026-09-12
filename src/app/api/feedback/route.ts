import { NextResponse } from "next/server";
import { z } from "zod";
import { persistEmailLog, readClientNotificationSettings } from "@/lib/server-events";
import { loadEmailConfiguration, sendEmail, type AlertSmtpConfiguration } from "@/lib/smtp";

const feedbackSchema=z.object({business:z.string().max(160),slug:z.string().max(160),rating:z.number().int().min(1).max(5),name:z.string().nullable().optional(),contact:z.string().min(1).max(200),message:z.string().min(1).max(5000)});
type DeliveryStatus="sent"|"not_sent"|"failed";

async function logDelivery(input:{businessSlug?:string;kind:"private_feedback"|"admin_failure_alert";status:DeliveryStatus;recipient:string;subject:string;error?:string;providerRole?:"primary"|"backup"}){try{await persistEmailLog({...input,occurredAt:Date.now()})}catch{/* logging must not hide the delivery result */}}

async function alertAdmin(problem:string,businessSlug:string,alert:AlertSmtpConfiguration|null){
  const recipient=alert?.recipient??""; const subject="myROI Reviews email delivery problem";
  if(!alert?.enabled){await logDelivery({businessSlug,kind:"admin_failure_alert",status:"not_sent",recipient,subject,error:"Independent alert SMTP is not configured"});return}
  try{await sendEmail(alert,{fromName:"myROI Reviews Monitor",fromEmail:alert.fromEmail,to:recipient,subject,text:`An email from myROI Reviews was not delivered.\n\nBusiness: ${businessSlug}\nProblem: ${problem}\nTime: ${new Date().toISOString()}\n\nOpen the reseller email log for details.`});await logDelivery({businessSlug,kind:"admin_failure_alert",status:"sent",recipient,subject})}
  catch(error){await logDelivery({businessSlug,kind:"admin_failure_alert",status:"failed",recipient,subject,error:error instanceof Error?error.message:"Backup alert delivery failed"})}
}

export async function POST(request:Request){
  const parsed=feedbackSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid feedback"},{status:400});
  const feedback=parsed.data; const clientSettings=await readClientNotificationSettings(feedback.slug).catch(()=>null); const recipient=clientSettings?.notificationEmail??process.env.FEEDBACK_NOTIFICATION_TO??""; const subject=`Private ${feedback.rating}-star feedback for ${feedback.business}`;
  if(clientSettings?.notifyPrivateFeedback===false||(!clientSettings&&process.env.SMTP_NOTIFY_PRIVATE_FEEDBACK==="false")){await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"not_sent",recipient,subject,error:"Private-feedback notifications are disabled for this client"});return NextResponse.json({accepted:true,notified:false,recipient,reason:"Notifications are disabled for this client"})}
  const{primary,alert}=await loadEmailConfiguration().catch(()=>({primary:null,alert:null}));
  if(!primary||!recipient){const reason="Primary SMTP is not configured";await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"not_sent",recipient,subject,error:reason});await alertAdmin(reason,feedback.slug,alert);return NextResponse.json({accepted:true,notified:false,recipient,reason},{status:202})}
  const message={fromName:primary.fromName,fromEmail:primary.fromEmail,to:recipient,replyTo:feedback.contact.includes("@")?feedback.contact:undefined,subject,text:`Business: ${feedback.business}\nRating: ${feedback.rating}/5\nName: ${feedback.name??"Not supplied"}\nContact: ${feedback.contact}\n\n${feedback.message}`};
  try{await sendEmail(primary,message);await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"sent",recipient,subject,providerRole:"primary"});return NextResponse.json({accepted:true,notified:true,recipient,provider:"primary"})}
  catch(error){const primaryReason=sanitizeError(error);await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"failed",recipient,subject,error:primaryReason,providerRole:"primary"});if(alert){try{await sendEmail(alert,{...message,fromName:"myROI Reviews",fromEmail:alert.fromEmail});await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"sent",recipient,subject,providerRole:"backup"});await alertAdmin(`Primary provider failed; client message was delivered by backup. ${primaryReason}`,feedback.slug,alert);return NextResponse.json({accepted:true,notified:true,recipient,provider:"backup"})}catch(backupError){const backupReason=sanitizeError(backupError);await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"failed",recipient,subject,error:backupReason,providerRole:"backup"});await alertAdmin(`Primary: ${primaryReason}; backup: ${backupReason}`,feedback.slug,alert);return NextResponse.json({accepted:true,notified:false,recipient,error:`Primary and backup delivery failed: ${backupReason}`},{status:502})}}await alertAdmin(primaryReason,feedback.slug,alert);return NextResponse.json({accepted:true,notified:false,recipient,error:primaryReason},{status:502})}
}

function sanitizeError(error:unknown){return(error instanceof Error?error.message:"SMTP delivery failed").replace(/(pass(?:word)?|token|secret)=?\s*[^\s,;]+/gi,"$1=[redacted]").slice(0,500)}
