import { ButtonLink } from "@/shared/ui/primitives/button";
import { EmptyState } from "@/shared/ui/primitives/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <EmptyState title="Halaman tidak ditemukan" body="Link-nya mungkin salah ketik atau halamannya sudah dipindah.">
        <ButtonLink href="/dashboard" tone="cyan" size={48} font="body" className="mt-2">
          Kembali ke beranda
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
