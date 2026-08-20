import "@/styles/globals.css";
import { UpdateNotification } from "@/components/UpdateNotification";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <UpdateNotification />
      <Component {...pageProps} />
    </main>
  );
}
