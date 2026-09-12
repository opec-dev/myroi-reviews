import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbUrl=process.env.NEXT_PUBLIC_CONVEX_URL;if(!dbUrl)return new Response("Review service unavailable",{status:503});
  const data=await new ConvexHttpClient(dbUrl).query(makeFunctionReference<"query">("reviews:publicBySlug"),{slug}) as null|{business:{name:string;primaryColor:string;publicReviewPageUrl?:string};reviews:Array<{reviewerName:string;rating:number;excerpt:string;sourceLabel:string;sourceUrl:string}>};
  if(!data)return new Response("Review widget not found",{status:404});
  const payload = JSON.stringify({
    business: data.business.name,
    accent: data.business.primaryColor,
    publicUrl: data.business.publicReviewPageUrl||`/reviews/${slug}`,
    reviews: data.reviews.map(review=>({reviewer:review.reviewerName,rating:review.rating,excerpt:review.excerpt,source:review.sourceLabel,sourceUrl:review.sourceUrl})),
  }).replaceAll("<", "\\u003c");

  const source = String.raw`(() => {
    if (window.__myroiReviewWidget) return;
    window.__myroiReviewWidget = true;
    const data = ${payload};
    const ownScript = document.currentScript;
    const origin = ownScript && ownScript.src ? new URL(ownScript.src).origin : window.location.origin;
    const host = document.createElement("div");
    host.setAttribute("data-myroi-reviews", "");
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = '<style>*{box-sizing:border-box}.badge{position:fixed;left:20px;bottom:22px;z-index:2147483000;display:flex;align-items:center;gap:11px;max-width:min(360px,calc(100vw - 40px));padding:11px 15px;border:0;border-radius:999px;background:#fff;color:#172033;box-shadow:0 8px 30px #14213d2b;font:14px/1.3 system-ui,sans-serif;cursor:pointer;opacity:0;transform:translateY(12px);transition:.25s}.badge.show{opacity:1;transform:none}.avatar{display:grid;place-items:center;width:37px;height:37px;border-radius:50%;background:'+data.accent+';color:#fff;font-weight:800}.copy{display:grid;text-align:left}.stars{color:#f6ad22;letter-spacing:1px}.copy small{color:#657089}.panel{position:fixed;left:20px;bottom:82px;z-index:2147483001;width:min(390px,calc(100vw - 40px));max-height:min(580px,75vh);overflow:auto;padding:20px;border:1px solid #e4e8ef;border-radius:18px;background:#fff;color:#172033;box-shadow:0 18px 55px #14213d38;font:14px/1.5 system-ui,sans-serif;display:none}.panel.open{display:block}.head{display:flex;justify-content:space-between;gap:20px;align-items:center;padding-bottom:14px;border-bottom:1px solid #e4e8ef}.head button{border:0;background:#edf1f7;border-radius:50%;width:30px;height:30px;cursor:pointer}.review{padding:17px 0;border-bottom:1px solid #edf0f5}.review p{margin:8px 0;color:#3f4a61}.review a,.all{color:'+data.accent+';font-weight:750}.all{display:block;margin-top:16px;text-align:center}@media(max-width:560px){.badge{left:12px;bottom:14px}.panel{left:12px;bottom:76px;width:calc(100vw - 24px)}}</style><button class="badge" aria-label="Read customer reviews"><span class="avatar"></span><span class="copy"><span class="stars">★★★★★</span><small></small></span></button><section class="panel" role="dialog" aria-label="Customer reviews"><div class="head"><strong></strong><button aria-label="Close reviews">×</button></div><div class="reviews"></div><a class="all" target="_blank" rel="noopener">Read all reviews →</a></section>';
    const badge = root.querySelector(".badge");
    const panel = root.querySelector(".panel");
    const avatar = root.querySelector(".avatar");
    const summary = root.querySelector(".copy small");
    root.querySelector(".head strong").textContent = data.business + " reviews";
    const allLink = root.querySelector(".all");
    allLink.href = /^https:\/\//i.test(data.publicUrl) ? data.publicUrl : origin + data.publicUrl;
    const safe = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    root.querySelector(".reviews").innerHTML = data.reviews.map((review) => '<article class="review"><span class="stars">'+'★'.repeat(review.rating)+'</span><p>“' + safe(review.excerpt) + '”</p><strong>' + safe(review.reviewer) + '</strong> · ' + safe(review.source) + (review.sourceUrl ? '<br><a href="' + safe(review.sourceUrl) + '" target="_blank" rel="noopener">View original review ↗</a>' : '') + '</article>').join("");
    let index = 0;
    const showReview = () => {
      const review = data.reviews[index % data.reviews.length];
      avatar.textContent = review.reviewer.slice(0, 1).toUpperCase();
      summary.textContent = "5-star review by " + review.reviewer;
      index += 1;
    };
    if (!data.reviews.length) { badge.remove(); panel.remove(); return; }
    showReview();
    setTimeout(() => badge.classList.add("show"), 1200);
    setInterval(showReview, 15000);
    badge.addEventListener("click", () => panel.classList.toggle("open"));
    root.querySelector(".head button").addEventListener("click", () => panel.classList.remove("open"));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") panel.classList.remove("open"); });
  })();`;

  return new Response(source, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
