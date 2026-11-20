"use client";

import { useRef, useState, useTransition } from "react";
import type { QuickDraft } from "../../domain/quick-draft";
import { parseQuickEntryAction, readReceiptAction, saveQuickDraftsAction, type QuickReply } from "../actions";
import type { DraftVM } from "../view-models/draft-view-model";

export type ChatMessage =
  | { id: number; kind: "ai-text"; text: string }
  | { id: number; kind: "user-text"; text: string; voice: boolean }
  | { id: number; kind: "user-photo" }
  | { id: number; kind: "typing"; text: string }
  | { id: number; kind: "draft"; intro: string; note?: string; drafts: QuickDraft[]; view: DraftVM; status: "pending" | "saving" | "saved"; error?: string };

/** State percakapan Catat cepat: kirim teks / foto, terima draf, konfirmasi simpan. */
export function useQuickAddChat(greeting: string) {
  const nextId = useRef(1);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 0, kind: "ai-text", text: greeting }]);
  const [, startTransition] = useTransition();

  const id = () => nextId.current++;
  const push = (message: ChatMessage) => setMessages((list) => [...list, message]);
  const replaceTyping = (message: ChatMessage) => setMessages((list) => [...list.filter((item) => item.kind !== "typing"), message]);

  function handleReply(reply: QuickReply) {
    replaceTyping(
      reply.kind === "draft"
        ? { id: id(), kind: "draft", intro: reply.intro, note: reply.note, drafts: reply.drafts, view: reply.view, status: "pending" }
        : { id: id(), kind: "ai-text", text: reply.text },
    );
  }

  function sendText(text: string, voice = false) {
    const trimmed = text.trim();
    if (!trimmed) return;
    push({ id: id(), kind: "user-text", text: trimmed, voice });
    push({ id: id(), kind: "typing", text: "Koko sedang membaca…" });
    startTransition(async () => handleReply(await parseQuickEntryAction(trimmed)));
  }

  function sendPhoto() {
    push({ id: id(), kind: "user-photo" });
    push({ id: id(), kind: "typing", text: "Membaca nota…" });
    startTransition(async () => handleReply(await readReceiptAction()));
  }

  function saveDraft(messageId: number) {
    const message = messages.find((item) => item.id === messageId);
    if (!message || message.kind !== "draft" || message.status !== "pending") return;
    const update = (patch: Partial<Extract<ChatMessage, { kind: "draft" }>>) =>
      setMessages((list) => list.map((item) => (item.id === messageId && item.kind === "draft" ? { ...item, ...patch } : item)));

    update({ status: "saving", error: undefined });
    startTransition(async () => {
      const result = await saveQuickDraftsAction(message.drafts);
      if (!result.ok) {
        update({ status: "pending", error: result.message });
        return;
      }
      update({ status: "saved" });
      push({ id: id(), kind: "ai-text", text: "Sip, sudah dicatat! Ada lagi yang mau ditambahkan?" });
    });
  }

  return { messages, sendText, sendPhoto, saveDraft };
}
