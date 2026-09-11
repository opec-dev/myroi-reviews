import "server-only";

import nodemailer from "nodemailer";
import { readMasterEmailSettings } from "@/lib/server-events";
import { decryptSmtpSecret } from "@/lib/smtp-secrets";

export type SmtpConfiguration={host:string;port:number;user:string;password:string;fromName:string;fromEmail:string;testRecipient:string};
export type AlertSmtpConfiguration={host:string;port:number;user:string;password:string;fromEmail:string;recipient:string;enabled:boolean};

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
