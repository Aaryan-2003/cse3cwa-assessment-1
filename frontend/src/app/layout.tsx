import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import {
  DEFAULT_MOTION,
  DEFAULT_TEXT_SIZE,
  DEFAULT_THEME,
  MOTION_COOKIE,
  TEXT_SIZE_COOKIE,
  THEME_COOKIE,
  isMotion,
  isTextSize,
  isTheme,
} from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description:
    "A frontend builder for phoneme-based Wordle and Word Search classroom activities.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const cookieTextSize = cookieStore.get(TEXT_SIZE_COOKIE)?.value;
  const textSize = isTextSize(cookieTextSize) ? cookieTextSize : DEFAULT_TEXT_SIZE;
  const cookieMotion = cookieStore.get(MOTION_COOKIE)?.value;
  const motion = isMotion(cookieMotion) ? cookieMotion : DEFAULT_MOTION;

  const htmlClasses = [
    geistSans.variable,
    geistMono.variable,
    "h-full antialiased",
    theme === "dark" ? "dark" : "",
    textSize === "large" ? "text-large" : "",
    motion === "reduced" ? "reduce-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="en" className={htmlClasses}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider initialTheme={theme} initialTextSize={textSize} initialMotion={motion}>
          <NavBar />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
