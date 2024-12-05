import { DM_Sans } from "next/font/google";
import "./globals.css";
import "../app/style.scss";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./provider";
import { Toaster } from "@/app/components/ui/toaster"

const dm_sans = DM_Sans({
  weight: ["400", "600", "700"],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});
export const metadata = {
  title: "Requestify",
  description: "Secure third-party payments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dm_sans.variable}>
      <body>
        <div className="gradient-bg">
        </div>
        <Providers>{children}</Providers>
        <Toaster/>
      </body>
    </html>
  );
}
