import "server-only";

import nodemailer from "nodemailer";
import { readMasterEmailSettings } from "@/lib/server-events";
import { decryptSmtpSecret } from "@/lib/smtp-secrets";

export type SmtpConfiguration={host:string;port:number;user:string;password:string;fromName:string;fromEmail:string;testRecipient:string};
export type AlertSmtpConfiguration={host:string;port:number;user:string;password:string;fromEmail:string;recipient:string;enabled:boolean};
export type EmailMessage={fromName:string;fromEmail:string;to:string;subject:string;text:string;replyTo?:string};
export type EmailDeliveryResult={messageId:string;transport:"mailjet_api"|"smtp"};

export async function loadEmailConfiguration(){
  const saved=await readMasterEmailSettings();
  if(saved?.smtpHost&&saved.smtpUser&&saved.smtpPasswordCiphertext&&saved.fromEmail){
    const primary:SmtpConfiguration={host:saved.smtpHost,port:saved.smtpPort||587,user:saved.smtpUser,password:await decryptSmtpSecret(saved.smtpPasswordCiphertext),fromName:saved.fromName||"myROIagency Reviews",fromEmail:saved.fromEmail,testRecipient:saved.smtpTestRecipient??""};
    const alert:AlertSmtpConfiguration|null=saved.alertSmtpHost&&saved.alertSmtpUser&&saved.alertSmtpPasswordCiphertext&&saved.alertFromEmail&&saved.failureAlertEmail?{host:saved.alertSmtpHost,port:saved.alertSmtpPort||587,user:saved.alertSmtpUser,password:await decryptSmtpSecret(saved.alertSmtpPasswordCiphertext),fromEmail:saved.alertFromEmail,recipient:saved.failureAlertEmail,enabled:saved.notifyEmailFailures!==false}:null;
    return{primary,alert};
  }
  const primary:SmtpConfiguration|null=process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD&&process.env.SMTP_FROM_EMAIL?{host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT??587),user:process.env.SMTP_USER,password:process.env.SMTP_PASSWORD,fromName:process.env.SMTP_FROM_NAME??"myROIagency Reviews",fromEmail:process.env.SMTP_FROM_EMAIL,testRecipient:process.env.SMTP_TEST_TO?.trim()||process.env.SMTP_FAILURE_ALERT_TO?.trim()||""}:null;
  return{primary,alert:null};
}

export function createSmtpTransport(config:SmtpConfiguration|AlertSmtpConfiguration){
  return nodemailer.createTransport({host:config.host,port:config.port,secure:config.port===465,auth:{user:config.user,pass:config.password},connectionTimeout:15_000,greetingTimeout:15_000,socketTimeout:30_000});
}

export async function sendEmail(config:SmtpConfiguration|AlertSmtpConfiguration,message:EmailMessage):Promise<EmailDeliveryResult>{
  if(isMailjet(config.host))return await sendWithMailjet(config,message);
  try{return await sendWithSmtp(config,message)}catch(error){if(config.host.trim().toLowerCase()==="smtp-pulse.com"&&config.port!==465&&/timeout|timed out|etimedout/i.test(error instanceof Error?error.message:""))return await sendWithSmtp({...config,port:465},message);throw error}
}

async function sendWithSmtp(config:SmtpConfiguration|AlertSmtpConfiguration,message:EmailMessage){const transport=createSmtpTransport(config);try{const result=await transport.sendMail({from:{name:message.fromName,address:message.fromEmail},to:message.to,replyTo:message.replyTo,subject:message.subject,text:message.text});return{messageId:result.messageId,transport:"smtp" as const}}finally{transport.close()}}

function isMailjet(host:string){return host.trim().toLowerCase()==="in-v3.mailjet.com"||host.trim().toLowerCase().endsWith(".mailjet.com")}

async function sendWithMailjet(config:SmtpConfiguration|AlertSmtpConfiguration,message:EmailMessage):Promise<EmailDeliveryResult>{
  const response=await fetch("https://api.mailjet.com/v3.1/send",{method:"POST",headers:{authorization:`Basic ${Buffer.from(`${config.user}:${config.password}`).toString("base64")}`,"content-type":"application/json"},body:JSON.stringify({Messages:[{From:{Email:message.fromEmail,Name:message.fromName},To:[{Email:message.to}],...(message.replyTo?{ReplyTo:{Email:message.replyTo}}:{}),Subject:message.subject,TextPart:message.text}]}) ,signal:AbortSignal.timeout(15_000)});
  const payload=await response.json().catch(()=>null) as null|{Messages?:Array<{Status?:string;To?:Array<{MessageID?:number|string;Errors?:Array<{ErrorMessage?:string}>}>;Errors?:Array<{ErrorMessage?:string}>}>;ErrorMessage?:string};
  const result=payload?.Messages?.[0];
  if(!response.ok||result?.Status!=="success"){
    const detail=result?.Errors?.[0]?.ErrorMessage??result?.To?.[0]?.Errors?.[0]?.ErrorMessage??payload?.ErrorMessage??response.statusText;
    throw new Error(`Mailjet rejected the message (${response.status})${detail?`: ${detail}`:"."}`);
  }
  return{messageId:String(result.To?.[0]?.MessageID??"mailjet-accepted"),transport:"mailjet_api"};
}
