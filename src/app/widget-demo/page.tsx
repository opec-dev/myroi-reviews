import Script from "next/script";

export default function WidgetDemoPage() {
  const widgetSuffix = process.env.STATIC_EXPORT === "true" ? ".js" : "";

  return (
    <main style={{ minHeight: "100vh", padding: "8vw", background: "#f7f4ee" }}>
      <article style={{ maxWidth: 760, margin: "auto", padding: 50, borderRadius: 24, background: "white", boxShadow: "0 18px 55px #42362414" }}>
        <p className="eyebrow">Customer website preview</p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", lineHeight: 0.95, letterSpacing: "-.055em" }}>A roof built for the long haul.</h1>
        <p className="lede">This stand-in page verifies that the popup is isolated from an unrelated website and stays anchored while visitors browse.</p>
        <div style={{ height: 700, borderRadius: 18, background: "linear-gradient(135deg,#155aa8,#0c2d57)" }} />
      </article>
      <Script src={`/widget/yorkshire-roofing${widgetSuffix}`} strategy="afterInteractive" />
    </main>
  );
}
