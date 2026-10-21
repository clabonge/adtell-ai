import type { Metadata, Viewport } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { Suspense } from "react";
import { MobileAuditBar } from "@/components/MobileAuditBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/ui";
import { site } from "@/content/site";
import { organizationJsonLd } from "@/lib/structured-data";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | AI consulting that cuts operating cost`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder.name, url: "/about" }],
  creator: site.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b0a",
  colorScheme: "dark",
};

function HeaderFallback() {
  return (
    <div className="border-b border-line bg-void">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
        <span className="font-serif text-2xl tracking-tight text-ivory">
          <span className="sr-only">{site.name}</span>
          <span aria-hidden="true">
            Adtell<span className="text-oxblood">.ai</span>
          </span>
        </span>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-void font-sans text-ivory">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Suspense fallback={null}>
          <MobileAuditBar />
        </Suspense>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
