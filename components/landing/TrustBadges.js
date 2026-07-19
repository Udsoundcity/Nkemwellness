import { Truck, ShieldCheck, BadgeCheck, Star, Clock, Lock, HeartHandshake } from "lucide-react";

const ICONS = {
  truck: Truck,
  shield: ShieldCheck,
  "badge-check": BadgeCheck,
  star: Star,
  clock: Clock,
  lock: Lock,
  heart: HeartHandshake
};

export default function TrustBadges({ badges = [] }) {
  const items = badges.filter((b) => b?.text);
  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map((badge, i) => {
            const Icon = ICONS[badge.icon] || ShieldCheck;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={17} />
                </span>
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
