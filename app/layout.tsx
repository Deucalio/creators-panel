import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    // Child segments set a bare string and get the suffix for free; `default`
    // covers the segments that set nothing at all, including the 404.
    template: "%s · PartnerLoop",
    default: "PartnerLoop for creators",
  },
  description: "Track the sales you refer and the commission you earn.",
  // Creator pages are private and there is no public landing page, so there is
  // nothing here worth indexing.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("partnerloop-theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
      </head>
      {/* Font and ground live here rather than on each page: a page that forgot
          them used to silently fall back to Arial on the browser default white. */}
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}
