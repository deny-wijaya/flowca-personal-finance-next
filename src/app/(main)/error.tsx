"use client";

import { useEffect } from "react";

export default function MainError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // TODO(observability): kirim ke error tracker (Sentry, dsb.) saat sudah dipasang.
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950">
      <h2 className="font-semibold text-rose-700 dark:text-rose-300">Data gagal dimuat</h2>
      <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-300/80">
        Server tidak merespons atau sedang bermasalah. Coba muat ulang beberapa saat lagi.
      </p>
      <button
        onClick={() => retry()}
        className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
