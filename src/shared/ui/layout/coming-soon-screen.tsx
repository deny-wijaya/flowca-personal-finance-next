import { EmptyState } from "../primitives/empty-state";

/** Pengganti sementara untuk layar yang belum didesain (Insight, Akun, Pengaturan). */
export function ComingSoonScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6 lg:px-8 lg:pt-7">
      <h1 className="m-0 font-display text-28 font-bold lg:text-36">{title}</h1>
      <EmptyState title="Segera hadir" body={body} className="lg:max-w-xl" />
    </div>
  );
}
