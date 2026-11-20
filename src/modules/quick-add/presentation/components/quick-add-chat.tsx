"use client";

import { useEffect, useRef, useState } from "react";
import { Chip } from "@/shared/ui/primitives/chip";
import { Icon } from "@/shared/ui/primitives/icon";
import { ChatMessageView } from "./chat-parts";
import { QuickAddComposer } from "./quick-add-composer";
import { useQuickAddChat } from "./use-quick-add-chat";
import { VoiceRecorder } from "./voice-recorder";

const SUGGESTIONS = ["Makan siang 25rb tunai", "Gaji masuk 6,5jt ke bank", "Kopi 22rb, ojek 18rb", "Token listrik 150rb kemarin"];

/** Percakapan Catat cepat versi halaman penuh (mobile). */
export function QuickAddChat({ greeting }: { greeting: string }) {
  const chat = useQuickAddChat(greeting);
  const [listening, setListening] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [chat.messages]);

  return (
    <>
      <div ref={logRef} role="log" aria-live="polite" aria-label="Percakapan dengan Koko" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3.5">
        {chat.messages.map((message) => (
          <ChatMessageView key={message.id} message={message} onSave={chat.saveDraft} />
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
          <div className="fc-no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
            <Chip shape="suggestion" behavior="action" onClick={chat.sendPhoto}>
              <Icon name="cam" size={14} strokeWidth={2.8} />
              Foto nota
            </Chip>
            {SUGGESTIONS.map((suggestion) => (
              <Chip key={suggestion} shape="suggestion" behavior="action" className="font-semibold" onClick={() => chat.sendText(suggestion)}>
                {suggestion}
              </Chip>
            ))}
          </div>
          <QuickAddComposer id="qa-input" onSend={(text) => chat.sendText(text)} onPhoto={chat.sendPhoto} onMic={() => setListening(true)} />
        </>
      )}
    </>
  );
}
