"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldVariants } from "@/shared/ui/primitives/field.variants";
import { Icon } from "@/shared/ui/primitives/icon";
import { iconButtonVariants } from "@/shared/ui/primitives/icon-button";

/** Input chat Catat cepat: foto, teks, lalu tombol kirim (ada teks) atau mikrofon (kosong). */
export function QuickAddComposer({ id, onSend, onPhoto, onMic, variant = "mobile" }: { id: string; onSend: (text: string) => void; onPhoto?: () => void; onMic: () => void; variant?: "mobile" | "panel" }) {
  const [text, setText] = useState("");
  const panel = variant === "panel";
  const hasText = text.trim().length > 0;
  const actionClass = cn("fc-press flex flex-none cursor-pointer items-center justify-center rounded-xl border-3 border-ink text-ink shadow-hard-1", panel ? "h-11.5 w-12" : "h-12 w-13");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend(text);
        setText("");
      }}
      className={cn("m-0 flex items-center gap-2 border-t-3 border-ink", panel ? "px-4 pt-3 pb-4" : "bg-paper px-4 pt-2 pb-4.5")}
    >
      {onPhoto && (
        <button type="button" onClick={onPhoto} aria-label="Foto atau unggah nota" className={iconButtonVariants({ size: 48, radius: "xl", className: "cursor-pointer hover:bg-orange-100" })}>
          <Icon name="cam" size={22} />
        </button>
      )}
      <label htmlFor={id} className="fc-sr-only">
        Ketik transaksi
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder="Contoh: bensin 30rb tunai"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className={fieldVariants({ size: panel ? 46 : 48, border: "thick", radius: "xl", className: cn("flex-1 px-3", panel && "text-15") })}
      />
      {panel ? (
        <>
          <button type="button" onClick={onMic} aria-label="Bicara untuk mencatat" className={cn(actionClass, "bg-coral")}>
            <Icon name="mic" size={20} strokeLinecap="square" />
          </button>
          <button type="submit" aria-label="Kirim" className={cn(actionClass, "bg-orange")}>
            <Icon name="send" size={20} />
          </button>
        </>
      ) : hasText ? (
        <button type="submit" aria-label="Kirim" className={cn(actionClass, "bg-orange")}>
          <Icon name="send" size={22} />
        </button>
      ) : (
        <button type="button" onClick={onMic} aria-label="Bicara untuk mencatat" className={cn(actionClass, "bg-coral")}>
          <Icon name="mic" size={22} />
        </button>
      )}
    </form>
  );
}
