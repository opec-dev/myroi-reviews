import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

function client(){const url=process.env.NEXT_PUBLIC_CONVEX_URL;return url?new ConvexHttpClient(url):null}

export async function persistAnalyticsEvent(event:Record<string,unknown>){
  const db=client(); const secret=process.env.ANALYTICS_INGEST_SECRET;
  if(!db||!secret)return false;
  await db.mutation(makeFunctionReference<"mutation">("analytics:recordEvent"),{secret,...event});
  return true;
}

export async function persistEmailLog(log:Record<string,unknown>){
  const db=client(); const secret=process.env.ANALYTICS_INGEST_SECRET;
  if(!db||!secret)return false;
  await db.mutation(makeFunctionReference<"mutation">("analytics:recordEmail"),{secret,...log});
  return true;
}

export async function readClientNotificationSettings(businessSlug:string){
  const db=client(); const secret=process.env.ANALYTICS_INGEST_SECRET;
  if(!db||!secret)return null;
  return await db.query(makeFunctionReference<"query">("clientNotifications:forIngest"),{secret,businessSlug}) as null|{notificationEmail:string;notifyPrivateFeedback:boolean;notifyNewReviews:boolean};
}
