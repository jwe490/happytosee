import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

type Movie = {
  id: number;
  title: string;
  posterUrl: string;
  year?: number;
  rating?: number;
};

const MOODS = [
  { id: "relaxed", label: "Feeling Relaxed", tagline: "Chill vibes only" },
  { id: "hyped", label: "Feeling Hyped", tagline: "Adrenaline mode" },
  { id: "romantic", label: "Feeling Romantic", tagline: "Soft & sweet" },
  { id: "focused", label: "Feeling Focused", tagline: "Clean, smart, sharp" },
];

function MoodShareCard(props: {
  moodLabel: string;
  moodTagline: string;
  movie: Movie;
  shareUrl?: string;
  appName?: string;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const { moodLabel, moodTagline, movie, shareUrl, appName = "MoodFlix", cardRef } = props;

  return (
    <div
      ref={cardRef}
      style={{
        width: 1080,
        height: 1350,
        borderRadius: 32,
        overflow: "hidden",
        position: "relative",
        background: "#05070c",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <img
          src={movie.posterUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.05)",
            filter: "blur(14px) saturate(1.2) brightness(0.85)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,7,12,0.22) 0%, rgba(5,7,12,0.55) 48%, rgba(5,7,12,0.92) 100%)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 56,
          padding: 28,
          borderRadius: 26,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(18px) saturate(160%)",
          color: "white",
          boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>{appName}</div>
            <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: "-0.02em", marginTop: 6 }}>
              {moodLabel}
            </div>
            <div style={{ fontSize: 18, opacity: 0.85, marginTop: 6 }}>{moodTagline}</div>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 14,
              opacity: 0.95,
              whiteSpace: "nowrap",
            }}
          >
            {movie.year ? movie.year : ""} {movie.rating ? `• ★ ${movie.rating.toFixed(1)}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 22, alignItems: "center" }}>
          <img
            src={movie.posterUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: 160,
              height: 240,
              borderRadius: 18,
              objectFit: "cover",
              boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 34, fontWeight: 850, lineHeight: 1.05 }}>{movie.title}</div>
            <div style={{ marginTop: 12, fontSize: 16, opacity: 0.85 }}>
              {shareUrl ? `Try it: ${shareUrl}` : "Find your next watch by mood"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function shareOrDownloadPng(node: HTMLElement, fileName: string, text: string) {
  const dataUrl = await htmlToImage.toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#05070c",
  });

  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], fileName, { type: "image/png" });

  const nav: any = navigator;
  // Share files when supported (recommended: check canShare). [web:397]
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], text });
    return;
  }

  // Fallback download
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function MoodSharePage() {
  // Replace with your real movie list source:
  const movies: Movie[] = useMemo(
    () => [
      {
        id: 1,
        title: "Demon Slayer: Infinity Castle",
        posterUrl: "https://image.tmdb.org/t/p/w500/yourPosterPath.jpg",
        year: 2025,
        rating: 7.7,
      },
    ],
    []
  );

  const [moodId, setMoodId] = useState(MOODS[0].id);
  const [movieId, setMovieId] = useState(movies[0]?.id ?? 0);

  const mood = MOODS.find((m) => m.id === moodId) ?? MOODS[0];
  const movie = movies.find((m) => m.id === movieId) ?? movies[0];

  const cardRef = useRef<HTMLDivElement>(null);

  if (!movie) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Mood Share</h1>
      <p className="text-white/75 mt-2 max-w-3xl">
        Pick a mood + a movie, generate a shareable card, then share it to WhatsApp/Instagram or download it as a PNG.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <div className="text-white font-semibold">Choose mood</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMoodId(m.id)}
                className={`px-3 py-2 rounded-full border text-sm ${
                  moodId === m.id
                    ? "bg-white/20 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-5 text-white font-semibold">Choose movie</div>
          <select
            className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 text-white p-3"
            value={movieId}
            onChange={(e) => setMovieId(Number(e.target.value))}
          >
            {movies.map((mv) => (
              <option key={mv.id} value={mv.id}>
                {mv.title}
              </option>
            ))}
          </select>

          <button
            className="mt-5 w-full rounded-full bg-white/20 border border-white/25 text-white font-semibold py-3 hover:bg-white/25"
            onClick={async () => {
              if (!cardRef.current) return;
              await shareOrDownloadPng(
                cardRef.current,
                `mood-${mood.id}-movie-${movie.id}.png`,
                `${mood.label} — ${movie.title}`
              );
            }}
          >
            Share / Download PNG
          </button>

          <p className="text-white/60 text-sm mt-3">
            Note: Sharing images may fail if posters don’t allow CORS (then download still works).
          </p>
        </div>

        {/* Live preview (scaled) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <div className="text-white font-semibold mb-3">Preview</div>

          <div
            style={{
              width: "100%",
              aspectRatio: "4 / 5",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              position: "relative",
            }}
          >
            <div
              style={{
                transform: "scale(0.27)",
                transformOrigin: "top left",
                width: 1080,
                height: 1350,
              }}
            >
              <MoodShareCard
                cardRef={cardRef}
                moodLabel={mood.label}
                moodTagline={mood.tagline}
                movie={movie}
                shareUrl={window.location.origin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
                       }
