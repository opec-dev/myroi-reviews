import "server-only";

import nodemailer from "nodemailer";

export const smtpRequiredKeys = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM_EMAIL"] as const;

export function getSmtpStatus() {
  const missing = smtpRequiredKeys.filter(key => !process.env[key]?.trim());
  const port = Number(process.env.SMTP_PORT ?? 587);
  const testRecipient = process.env.SMTP_TEST_TO?.trim() || process.env.SMTP_FAILURE_ALERT_TO?.trim() || "";
  return {
    configured: missing.length === 0,
    missing,
    hostConfigured: Boolean(process.env.SMTP_HOST?.trim()),
    port: Number.isFinite(port) ? port : 587,
    userConfigured: Boolean(process.env.SMTP_USER?.trim()),
    passwordConfigured: Boolean(process.env.SMTP_PASSWORD?.trim()),
    fromEmailConfigured: Boolean(process.env.SMTP_FROM_EMAIL?.trim()),
    testRecipientConfigured: Boolean(testRecipient),
    testRecipient,
  };
}

export function createSmtpTransport() {
  const status = getSmtpStatus();
  if (!status.configured) throw new Error(`Missing Worker variables: ${status.missing.join(", ")}`);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: status.port,
    secure: status.port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

export function publicSmtpStatus() {
  const status = getSmtpStatus();
  return {
    configured: status.configured,
    missing: status.missing,
    smtpHostConfigured: status.hostConfigured,
    smtpUserConfigured: status.userConfigured,
    smtpPasswordConfigured: status.passwordConfigured,
    smtpFromEmailConfigured: status.fromEmailConfigured,
    smtpTestRecipientConfigured: status.testRecipientConfigured,
    alertSmtpPasswordConfigured: Boolean(process.env.ALERT_SMTP_PASSWORD?.trim()),
  };
}
