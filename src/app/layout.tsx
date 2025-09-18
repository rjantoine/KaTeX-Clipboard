import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: "MathType Clipboard",
  description: "Create and copy beautiful math equations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.css" />
        <script src="./smiles-drawer.js"></script>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossOrigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/mhchem.min.js" integrity="sha384-ifpG+NlgMq0kvOSGqGQxW1mJKpjjMDmZdpKGq3tbvD3WPhyshCEEYClriK/wRVU0" crossOrigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossOrigin="anonymous"></script>
      </body>
    </html>
  );
}
