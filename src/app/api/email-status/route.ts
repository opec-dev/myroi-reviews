import { publicSmtpStatus } from "@/lib/smtp";
import { withAuth } from "@workos-inc/authkit-nextjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try { const {user}=await withAuth({ensureSignedIn:true});const admins=(process.env.PLATFORM_ADMIN_EMAILS??"").split(",").map(value=>value.trim().toLowerCase());if(!admins.includes(user.email.toLowerCase()))return Response.json({error:"Administrator access required."},{status:403}); }
  catch { return Response.json({error:"Secure administrator sign-in is required."},{status:401}); }
  return Response.json(publicSmtpStatus(),{headers:{"Cache-Control":"no-store"}});
}
