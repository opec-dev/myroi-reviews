import "server-only";

const algorithm={name:"AES-GCM",length:256} as const;

async function encryptionKey(){
  const configured=process.env.SMTP_CREDENTIAL_ENCRYPTION_KEY;
  if(!configured)throw new Error("SMTP credential encryption is not configured");
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(configured));
  return await crypto.subtle.importKey("raw",digest,algorithm,false,["encrypt","decrypt"]);
}

export async function encryptSmtpSecret(value:string){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:"AES-GCM",iv},await encryptionKey(),new TextEncoder().encode(value));
  return Buffer.concat([Buffer.from(iv),Buffer.from(ciphertext)]).toString("base64url");
}

export async function decryptSmtpSecret(value:string){
  const packed=Buffer.from(value,"base64url");
  if(packed.length<29)throw new Error("Stored SMTP credential is invalid");
  const plaintext=await crypto.subtle.decrypt({name:"AES-GCM",iv:packed.subarray(0,12)},await encryptionKey(),packed.subarray(12));
  return new TextDecoder().decode(plaintext);
}
