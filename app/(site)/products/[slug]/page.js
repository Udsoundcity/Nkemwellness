import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabaseClient";
import { withContentDefaults } from "@/lib/defaultContent";

import HeroSection from "@/components/landing/HeroSection";
 import TopStory from "@/components/landing/TopStory";
import TrustBadges from "@/components/landing/TrustBadges";
import { Problem, Solution } from "@/components/landing/ProblemSolution";
import Benefits from "@/components/landing/Benefits";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Reviews from "@/components/landing/Reviews";
import BeforeAfter from "@/components/landing/BeforeAfter";
import FreeGift from "@/components/landing/FreeGift";
import FAQ from "@/components/landing/FAQ";
import OrderFormSection from "@/components/landing/OrderFormSection";
import StickyBottomBar from "@/components/landing/StickyBottomBar";
  import ProductVideo from "@/components/landing/ProductVideo";

export const revalidate = 0;

async function getProduct(slug) {
  const { data, error } = await supabasePublic
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

async function getForm(formId) {
  if (!formId) return null;
  const { data } = await supabasePublic.from("forms").select("*").eq("id", formId).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  const content = withContentDefaults(product.content);
  return {
    title: `${product.name} — The Shop`,
    description: content.hero.headline || undefined
  };
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const content = withContentDefaults(product.content);
  const needsForm = product.form_type === "embedded" || product.form_type === "iframe";
  const form = needsForm ? await getForm(product.form_id) : null;
  const ctaText = content.hero.cta_text || "Order Now";

  return (
      <div className="pb-24">
        <TopStory text={content.top_story} />
        <HeroSection product={product} hero={content.hero} />
      <TrustBadges badges={content.trust_badges} />
          <ProductVideo data={content.product_video} />
      <Problem data={content.problem} />
      <Solution data={content.solution} />
      <Benefits items={content.benefits} />
      <HowItWorks data={content.how_it_works} />
      <Features data={content.features} />
      <Reviews data={content.reviews} />
      <BeforeAfter items={content.before_after} />
      <FreeGift data={content.free_gift} />
      <OrderFormSection product={product} form={form} ctaText={ctaText} />
      <FAQ items={content.faq} />
      <StickyBottomBar price={content.hero.price} currency={content.hero.currency} ctaText={ctaText} />
    </div>
  );
}
