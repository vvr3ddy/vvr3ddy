import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Graph from "@/components/Graph";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "My Digital Garden",
  description: "A collection of evolving thoughts and notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = getAllPosts();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
          <Graph posts={posts} />
          <ThemeToggle />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
