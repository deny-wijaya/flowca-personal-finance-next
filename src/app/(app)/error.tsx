"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/primitives/button";
import { EmptyState } from "@/shared/ui/primitives/empty-state";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // TODO(observability): kirim ke error tracker (Sentry, dsb.) saat sudah dipasang.
    console.error(error);
  }, [error]);

  return (
    <div className="px-5 pt-6 lg:px-8">
      <EmptyState title="Data gagal dimuat" body="Server tidak merespons atau sedang bermasalah. Coba muat ulang beberapa saat lagi.">
        <Button tone="orange" size={48} font="body" className="mt-2" onClick={() => retry()}>
          Coba lagi
        </Button>
      </EmptyState>
    </div>
  );
}
