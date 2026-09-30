import { PremiumLanding } from "@/components/premium-landing";
export default function Page() {
  return (
    <>
      <PremiumLanding />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: "ClickZap",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
              },
              {
                "@type": "Organization",
                name: "ClickZap",
                url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              },
              {
                "@type": "WebSite",
                name: "ClickZap",
                url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              },
            ],
          }),
        }}
      />
    </>
  );
}
