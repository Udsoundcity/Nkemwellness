"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId, youTubeThumbnail, youTubeEmbedUrl } from "@/lib/media";

export default function ProductVideo({ data }) {
  const [playing, setPlaying] = useState(false);

  if (!data || !data.video_url) return null;

  const youtubeId = data.youtube_id || extractYouTubeId(data.video_url);
  const poster = data.poster || (youtubeId ? youTubeThumbnail(youtubeId) : "");

  return (
    <section className="py-8">
      <div className="container-page">
        <div className="card overflow-hidden">
          {data.title && (
            <div className="px-5 pt-5">
              <h2 className="font-display text-lg font-bold">{data.title}</h2>
            </div>
          )}
          <div className="relative mt-4 aspect-video w-full bg-line/40">
            {playing ? (
              youtubeId ? (
                <iframe
                  src={youTubeEmbedUrl(youtubeId, { autoplay: true })}
                  title={data.title || "Product video"}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={data.video_url}
                  poster={poster || undefined}
                  className="h-full w-full object-cover"
                  controls
                  autoPlay
                  playsInline
                />
              )
            ) : (
              <button onClick={() => setPlaying(true)} className="group relative h-full w-full" aria-label="Play video">
                {poster && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink">
                    <Play size={20} fill="currentColor" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
