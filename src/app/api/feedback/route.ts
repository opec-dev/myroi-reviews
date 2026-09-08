import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { persistEmailLog, readClientNotificationSettings } from "@/lib/server-events";

const feedbackSchema=z.object({business:z.string().max(160),slug:z.string().max(160),rating:z.number().int().min(1).max(5),name:z.string().nullable().optional(),contact:z.string().min(1).max(200),message:z.string().min(1).max(5000)});
type DeliveryStatus="sent"|"not_sent"|"failed";

async function logDelivery(input:{businessSlug?:string;kind:"private_feedback"|"admin_failure_alert";status:DeliveryStatus;recipient:string;subject:string;error?:string}){try{await persistEmailLog({...input,occurredAt:Date.now()})}catch{/* logging must not hide the delivery result */}}

async function alertAdmin(problem:string,businessSlug:string){
  if(process.env.SMTP_NOTIFY_FAILURES==="false")return;
  const recipient=process.env.SMTP_FAILURE_ALERT_TO??""; const subject="myROI Reviews email delivery problem";
  const host=process.env.ALERT_SMTP_HOST; const user=process.env.ALERT_SMTP_USER; const password=process.env.ALERT_SMTP_PASSWORD; const from=process.env.ALERT_SMTP_FROM_EMAIL;
  if(!recipient||!host||!user||!password||!from){await logDelivery({businessSlug,kind:"admin_failure_alert",status:"not_sent",recipient,subject,error:"Independent alert SMTP is not configured"});return}
  try{const transport=nodemailer.createTransport({host,port:Number(process.env.ALERT_SMTP_PORT??587),secure:Number(process.env.ALERT_SMTP_PORT)===465,auth:{user,pass:password}});await transport.sendMail({from:{name:"myROI Reviews Monitor",address:from},to:recipient,subject,text:`An email from myROI Reviews was not delivered.\n\nBusiness: ${businessSlug}\nProblem: ${problem}\nTime: ${new Date().toISOString()}\n\nOpen the reseller email log for details.`});await logDelivery({businessSlug,kind:"admin_failure_alert",status:"sent",recipient,subject})}
  catch(error){await logDelivery({businessSlug,kind:"admin_failure_alert",status:"failed",recipient,subject,error:error instanceof Error?error.message:"Backup alert delivery failed"})}
}

export async function POST(request:Request){
  const parsed=feedbackSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid feedback"},{status:400});
  const feedback=parsed.data; const clientSettings=await readClientNotificationSettings(feedback.slug).catch(()=>null); const recipient=clientSettings?.notificationEmail??process.env.FEEDBACK_NOTIFICATION_TO??""; const subject=`Private ${feedback.rating}-star feedback for ${feedback.business}`;
  if(clientSettings?.notifyPrivateFeedback===false||(!clientSettings&&process.env.SMTP_NOTIFY_PRIVATE_FEEDBACK==="false")){await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"not_sent",recipient,subject,error:"Private-feedback notifications are disabled for this client"});return NextResponse.json({accepted:true,notified:false,recipient,reason:"Notifications are disabled for this client"})}
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM_EMAIL}=process.env;
  if(!SMTP_HOST||!SMTP_USER||!SMTP_PASSWORD||!SMTP_FROM_EMAIL||!recipient){const reason="Primary SMTP is not configured";await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"not_sent",recipient,subject,error:reason});await alertAdmin(reason,feedback.slug);return NextResponse.json({accepted:true,notified:false,recipient,reason},{status:202})}
  try{const transport=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT??587),secure:Number(SMTP_PORT)===465,auth:{user:SMTP_USER,pass:SMTP_PASSWORD}});await transport.sendMail({from:{name:process.env.SMTP_FROM_NAME??"myROIagency Reviews",address:SMTP_FROM_EMAIL},to:recipient,replyTo:feedback.contact.includes("@")?feedback.contact:undefined,subject,text:`Business: ${feedback.business}\nRating: ${feedback.rating}/5\nName: ${feedback.name??"Not supplied"}\nContact: ${feedback.contact}\n\n${feedback.message}`});await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"sent",recipient,subject});return NextResponse.json({accepted:true,notified:true,recipient})}
  catch(error){const reason=error instanceof Error?error.message:"SMTP delivery failed";await logDelivery({businessSlug:feedback.slug,kind:"private_feedback",status:"failed",recipient,subject,error:reason});await alertAdmin(reason,feedback.slug);return NextResponse.json({accepted:true,notified:false,recipient,error:reason},{status:502})}
}
