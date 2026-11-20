"use client";

import { cva } from "class-variance-authority";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/primitives/button";

/** Kalimat contoh yang "terdengar" selama pengenalan suara masih simulasi. */
const SIMULATED_SPEECH = "tadi kopi susu 22 ribu pakai bank".split(" ");
const BAR_TONES = ["ink", "coral", "orange", "cyan", "pink"] as const;

const barVariants = cva("h-8 w-1.5 origin-center animate-pixel-wave", {
  variants: { tone: { ink: "bg-ink", coral: "bg-coral", orange: "bg-orange", cyan: "bg-cyan", pink: "bg-pink" } },
});

/**
 * Panel "MENDENGARKAN…". TODO(quick-add): ganti transkrip tiruan dengan Web Speech API
 * atau layanan speech-to-text di balik port saat tersedia.
 */
export function VoiceRecorder({ onCancel, onFinish }: { onCancel: () => void; onFinish: (transcript: string) => void }) {
  const [words, setWords] = useState(0);

  useEffect(() => {
    if (words >= SIMULATED_SPEECH.length) return;
    const timer = setTimeout(() => setWords((count) => count + 1), 380);
    return () => clearTimeout(timer);
  }, [words]);

  const heard = SIMULATED_SPEECH.slice(0, words).join(" ");

  return (
    <div role="status" className="flex flex-col items-center gap-3 border-t-3 border-ink bg-orange-100 px-4 pt-4 pb-5">
      <div className="text-12 font-bold tracking-[0.08em]">MENDENGARKAN…</div>
      <div aria-hidden="true" className="flex h-9 items-center gap-1">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index} className={barVariants({ tone: BAR_TONES[index % 5] })} style={{ animationDelay: `${((index * 137) % 900) / 1000}s` }} />
        ))}
      </div>
      <div className={cn("min-h-11 w-full rounded-xl border-3 border-ink bg-paper px-3 py-2.5 text-center text-16", heard ? "text-ink" : "text-ink-500")}>{heard || "Mulai bicara…"}</div>
      <div className="flex w-full gap-2.5">
        <Button tone="paper" size={50} font="body-sm" elevation={1} className="flex-1" onClick={onCancel}>
          Batal
        </Button>
        <Button tone="coral" size={50} font="body-sm" elevation={1} className="flex-2" onClick={() => onFinish(heard)}>
          Selesai bicara
        </Button>
      </div>
    </div>
  );
}
