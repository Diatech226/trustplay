import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./Providers";

export const metadata = {
  title: "Trust Media",
  description: "Média en ligne Trust Media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-neutral-950 text-white">
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
