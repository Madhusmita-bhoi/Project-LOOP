import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LOOP | AI Customer Feedback Intelligence Platform",
  description: "Transform multi-channel customer feedback into classified themes, trends, grounded Q&A, and Voice-of-Customer intelligence.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
