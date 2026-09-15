import { handleAuth } from "@workos-inc/authkit-nextjs";
import { APP_ORIGIN } from "@/lib/auth-config";

export const GET = handleAuth({ baseURL: APP_ORIGIN, returnPathname: "/admin" });
