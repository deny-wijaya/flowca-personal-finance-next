"use client";

import { useEffect, useRef, useState } from "react";
import { useAppShell } from "@/shared/ui/layout/app-shell-context";
import { Icon } from "@/shared/ui/primitives/icon";
import { IconButton } from "@/shared/ui/primitives/icon-button";
import { Koko } from "@/shared/ui/primitives/koko";
import { ChatMessageView } from "./chat-parts";
import { QuickAddComposer } from "./quick-add-composer";
import { useQuickAddChat } from "./use-quick-add-chat";
import { VoiceRecorder } from "./voice-recorder";

/** Panel kanan Catat cepat di desktop (dibuka dari Sidebar atau tombol N). Esc menutup panel. */
export function QuickAddPanel({ greeting, subtitle }: { greeting: string; subtitle: string }) {
  const { closePanel } = useAppShell();
  const chat = useQuickAddChat(greeting);
  const [listening, setListening] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [chat.messages]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePanel]);

  return (
    <aside id="quick-panel" aria-label="Catat cepat" className="flex h-full w-full flex-col border-l-3 border-ink bg-paper">
      <div className="flex items-center gap-2.5 border-b-3 border-ink bg-orange-100 px-4 py-3.5">
        <Koko size={40} />
        <div className="flex flex-1 flex-col gap-px">
          <h2 className="m-0 text-18 font-bold">Catat cepat</h2>
          <span className="text-12 text-ink-600">{subtitle}</span>
        </div>
        <IconButton size={40} border="thin" onClick={closePanel} aria-label="Tutup panel catat cepat">
          <Icon name="x" size={16} strokeWidth={3.2} />
        </IconButton>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-label="Percakapan dengan Koko" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {chat.messages.map((message) => (
          <ChatMessageView key={message.id} message={message} onSave={chat.saveDraft} size="sm" />
        ))}
      </div>

      {listening ? (
        <VoiceRecorder
          onCancel={() => setListening(false)}
          onFinish={(transcript) => {
            setListening(false);
            chat.sendText(transcript, true);
          }}
        />
      ) : (
        <>
          <div className="px-4 pb-3">
            {/* TODO(quick-add): terima file nota asli (drag & drop / file picker) saat pembaca nota tersedia. */}
            <button
              type="button"
              onClick={chat.sendPhoto}
              className="flex min-h-16 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-3 border-dashed border-ink bg-cream font-body text-14 font-semibold text-ink"
            >
              <Icon name="cam" size={20} strokeLinecap="square" />
              <span>Seret foto nota ke sini, atau klik untuk pilih</span>
            </button>
          </div>
          <QuickAddComposer id="qp-input" variant="panel" onSend={(text) => chat.sendText(text)} onMic={() => setListening(true)} />
          <div className="px-4 pb-3.5 text-12 text-ink-600">Enter untuk kirim · Esc untuk tutup panel</div>
        </>
      )}
    </aside>
  );
}
