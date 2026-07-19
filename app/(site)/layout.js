import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FacebookPixel from "@/components/site/FacebookPixel";
import { supabasePublic } from "@/lib/supabaseClient";

export const revalidate = 0;

async function getSiteSettings() {
  const { data } = await supabasePublic.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data || {};
}

export default async function SiteLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <>
      <FacebookPixel pixelId={settings.facebook_pixel_id} />
      <Header settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </>
  );
}
