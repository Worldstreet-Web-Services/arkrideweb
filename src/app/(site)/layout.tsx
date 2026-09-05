import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Marketing site chrome — navbar + footer around every non-portal page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
    </>
  );
}
