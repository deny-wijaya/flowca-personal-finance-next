import { cva } from "class-variance-authority";
import { Amount } from "@/modules/transaction/presentation/components/amount";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/primitives/badge";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import { Icon } from "@/shared/ui/primitives/icon";
import { Notice } from "@/shared/ui/primitives/notice";
import type { ChatMessage } from "./use-quick-add-chat";

const bubbleVariants = cva("border-3 border-ink px-3 py-2.5 leading-[1.45] text-ink", {
  variants: {
    from: {
      ai: "self-start rounded-2xl rounded-bl-xs bg-paper shadow-hard-1",
      user: "self-end rounded-2xl rounded-br-xs bg-cyan leading-[1.4] shadow-hard-1",
    },
    size: { md: "text-15", sm: "text-14" },
  },
  defaultVariants: { from: "ai", size: "md" },
});

export function ChatBubble({ from, size, className, children }: { from: "ai" | "user"; size?: "md" | "sm"; className?: string; children: React.ReactNode }) {
  return <div className={cn(bubbleVariants({ from, size }), className)}>{children}</div>;
}

export function TypingBubble({ text }: { text: string }) {
  return (
    <div role="status" className="flex items-center gap-2 self-start rounded-2xl rounded-bl-xs border-3 border-ink bg-paper px-3 py-2.5 text-13 text-ink-600">
      <span aria-hidden="true" className="flex gap-1">
        <span className="size-1.5 animate-pixel-blink bg-ink" />
        <span className="size-1.5 animate-pixel-blink bg-ink [animation-delay:0.2s]" />
        <span className="size-1.5 animate-pixel-blink bg-ink [animation-delay:0.4s]" />
      </span>
      <span>{text}</span>
    </div>
  );
}

/** Foto nota contoh (pixel-art). */
export function ReceiptPhoto() {
  return (
    <div className="flex flex-col items-end gap-1 self-end">
      <div className="rounded-2xl rounded-br-xs border-3 border-ink bg-cyan p-2 shadow-hard-1">
        <svg viewBox="0 0 20 26" shapeRendering="crispEdges" role="img" aria-label="Foto nota belanja (contoh)" className="fc-pixel block h-39 w-30 bg-sand-200">
          <g className="fill-field">
            <rect x="3" y="1" width="14" height="23" />
            <rect x="3" y="24" width="2" height="1" />
            <rect x="7" y="24" width="2" height="1" />
            <rect x="11" y="24" width="2" height="1" />
            <rect x="15" y="24" width="2" height="1" />
          </g>
          <g className="fill-ink-300">
            <rect x="5" y="6" width="6" height="1" />
            <rect x="13" y="6" width="2" height="1" />
            <rect x="5" y="8" width="5" height="1" />
            <rect x="13" y="8" width="2" height="1" />
            <rect x="5" y="10" width="7" height="1" />
            <rect x="13" y="10" width="2" height="1" />
          </g>
          <g className="fill-ink">
            <rect x="6" y="3" width="8" height="1" />
            <rect x="5" y="13" width="10" height="1" />
            <rect x="5" y="15" width="4" height="1" />
            <rect x="11" y="15" width="4" height="1" />
          </g>
          <rect x="6" y="19" width="8" height="2" className="fill-sand-300" />
        </svg>
      </div>
      <div className="text-11 font-bold text-ink-600">nota.jpg · foto</div>
    </div>
  );
}

/** Kartu draf hasil AI: selalu butuh konfirmasi (Simpan) sebelum masuk riwayat. */
export function DraftCard({ message, onSave, size = "md" }: { message: Extract<ChatMessage, { kind: "draft" }>; onSave: () => void; size?: "md" | "sm" }) {
  const saved = message.status === "saved";
  const sm = size === "sm";
  return (
    <div className={cn("flex flex-col gap-2 self-start", sm ? "w-full" : "w-[92%]")}>
      <ChatBubble from="ai" size={size}>
        {message.intro}
      </ChatBubble>
      <div className="overflow-hidden rounded-2xl border-3 border-ink bg-paper shadow-hard-2">
        <div className={cn("flex items-center justify-between gap-2 border-b-3 border-ink px-3 py-2 text-12 font-bold", saved ? "bg-green-100" : "bg-orange-100")}>
          <span>{saved ? "Tersimpan" : message.view.pendingLabel}</span>
          <Badge tone="neutral">diisi AI</Badge>
        </div>
        <ul className="m-0 list-none p-0 [&>li+li]:border-t-2 [&>li+li]:border-dashed [&>li+li]:border-sand-200">
          {message.view.items.map((item, index) => (
            <li key={index} className="flex items-center gap-2.5 px-3 py-2.5">
              <CategoryTile initial={item.initial} tone={item.tone} size={sm ? 34 : 38} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-14 font-bold">{item.name}</span>
                <span className="text-12 text-ink-600">{item.meta}</span>
              </span>
              <Amount value={item.amount} direction={item.direction} />
            </li>
          ))}
        </ul>
        {message.note && <div className="border-t-2 border-dashed border-sand-200 px-3 py-2 text-12 text-ink-600">{message.note}</div>}
        {message.error && (
          <Notice tone="error" className="mx-3 mt-2">
            {message.error}
          </Notice>
        )}
        {saved ? (
          <div role="status" className="flex items-center gap-2 border-t-2 border-dashed border-sand-200 px-3 py-2.5 text-13 font-bold text-income">
            <Icon name="check" size={16} strokeWidth={3.4} />
            <span>Tersimpan ke riwayat</span>
          </div>
        ) : (
          <div className="flex gap-2 border-t-2 border-dashed border-sand-200 px-3 pt-2.5 pb-3">
            <Button tone="orange" size={sm ? 42 : 44} font="body-xs" elevation={1} className="flex-1" loading={message.status === "saving"} onClick={onSave}>
              {message.view.saveLabel}
            </Button>
            <ButtonLink href="/transactions/new" tone="paper" size={sm ? 42 : 44} font="body-xs" elevation={1}>
              Ubah
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}

/** Render satu pesan sesuai jenisnya. */
export function ChatMessageView({ message, onSave, size = "md" }: { message: ChatMessage; onSave: (id: number) => void; size?: "md" | "sm" }) {
  switch (message.kind) {
    case "ai-text":
      return (
        <ChatBubble from="ai" size={size} className={size === "sm" ? "max-w-[88%]" : "max-w-[85%]"}>
          {message.text}
        </ChatBubble>
      );
    case "user-text":
      return (
        <div className="flex max-w-[80%] flex-col items-end gap-1 self-end">
          <ChatBubble from="user" size={size}>
            {message.text}
          </ChatBubble>
          {message.voice && (
            <div className="flex items-center gap-1 text-11 font-bold text-ink-600">
              <Icon name="mic" size={12} strokeWidth={3} />
              via suara
            </div>
          )}
        </div>
      );
    case "user-photo":
      return <ReceiptPhoto />;
    case "typing":
      return <TypingBubble text={message.text} />;
    case "draft":
      return <DraftCard message={message} size={size} onSave={() => onSave(message.id)} />;
  }
}
