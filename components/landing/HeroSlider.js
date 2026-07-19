"use client";

import { useEffect, useRef, useState } from "react";
import { extractYouTubeId, youTubeEmbedUrl } from "@/lib/media";

const AUTOPLAY_MS = 4500;

function Slide({ item }) {
  const youtubeId = item.youtube_id || extractYouTubeId(item.url);

  if (item.type === "video" && youtubeId) {
    return (
      <iframe
        src={youTubeEmbedUrl(youtubeId, { autoplay: true, loop: true })}
        title="Product video"
        className="h-full w-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (item.type === "video") {
    return (
      <video
        src={item.url}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.url} alt="" className="h-full w-full object-cover" />;
}

export default function HeroSlider({ media = [] }) {
  const slides = media.filter((m) => m?.url).slice(0, 5);
  const [index, setIndex] = useState(0);
  const touchStart = useRef(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-line/50 text-sm text-muted sm:aspect-[16/10]">
        No media yet
      </div>
    );
  }

  function onTouchStart(e) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 40) {
      setIndex((i) => (delta < 0 ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length));
    }
    touchStart.current = null;
  }

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-line/40 sm:aspect-[16/10]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((item, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
        >
          <Slide item={item} />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 6,
                background: i === index ? "#ffffff" : "rgba(255,255,255,0.55)"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
