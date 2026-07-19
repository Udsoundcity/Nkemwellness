"use client";

import { Star, Play } from "lucide-react";
import { useState } from "react";
import { extractYouTubeId, youTubeThumbnail, youTubeEmbedUrl } from "@/lib/media";

function Stars({ rating = 5 }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function VideoReview({ item }) {
  const [playing, setPlaying] = useState(false);
  const youtubeId = item.youtube_id || extractYouTubeId(item.video_url);

  return (
    <div className="w-64 flex-none rounded-2xl border border-line bg-white overflow-hidden">
      <div className="relative aspect-[9/16] w-full bg-line/40">
        {playing ? (
          youtubeId ? (
            <iframe
              src={youTubeEmbedUrl(youtubeId, { autoplay: true })}
              title={item.name || "Customer review"}
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video src={item.video_url} className="h-full w-full object-cover" controls autoPlay playsInline />
          )
        ) : (
          <button onClick={() => setPlaying(true)} className="group relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={youtubeId ? youTubeThumbnail(youtubeId) : item.image || ""}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-ink">
                <Play size={18} fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold">{item.name}</p>
        <Stars rating={item.rating} />
      </div>
    </div>
  );
}

function PhotoReview({ item }) {
  return (
    <div className="w-56 flex-none rounded-2xl border border-line bg-white overflow-hidden">
      <div className="aspect-square w-full bg-line/40">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{item.name}</p>
          <Stars rating={item.rating} />
        </div>
        {item.text && <p className="mt-1 text-sm text-muted line-clamp-3">{item.text}</p>}
      </div>
    </div>
  );
}

function TextReview({ item }) {
  return (
    <div className="card p-5">
      <Stars rating={item.rating} />
      {item.text && <p className="mt-2 text-[15px] leading-relaxed">&ldquo;{item.text}&rdquo;</p>}
      <p className="mt-3 text-sm font-semibold text-muted">{item.name}</p>
    </div>
  );
}

export default function Reviews({ data }) {
  const items = (data?.items || []).filter((r) => r?.name);
  if (!data?.enabled || items.length === 0) return null;
  const mode = data.mode || "text";

  return (
    <section id="reviews" className="py-8">
      <div className="container-page">
        <h2 className="section-title">What Customers Say</h2>

        {mode === "text" && (
          <div className="mt-6 flex flex-col gap-4">
            {items.map((item, i) => (
              <TextReview key={i} item={item} />
            ))}
          </div>
        )}

        {(mode === "photo" || mode === "video") && (
          <div className="mt-6 -mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
            {items.map((item, i) =>
              mode === "video" ? <VideoReview key={i} item={item} /> : <PhotoReview key={i} item={item} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
