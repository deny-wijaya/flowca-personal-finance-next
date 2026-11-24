"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { loadMoreTransactionsAction } from "../actions";
import { transactionsHref, type TransactionListFilters, type TransactionRowVM } from "../view-models/transaction-view-model";

export type TransactionFirstPage = { rows: TransactionRowVM[]; nextCursor: string | null };

type LoadedPages = { key: string; rows: TransactionRowVM[]; nextCursor: string | null };

/**
 * State daftar transaksi di menu Transaksi, dipakai daftar mobile dan tabel desktop.
 *
 * - Halaman pertama dirender server sesuai filter di URL.
 * - `loadMore` memanggil Server Action dengan `nextCursor`, lalu menambahkan barisnya di bawah.
 * - `setFilters` mengganti URL. Server lalu merender ulang halaman pertama untuk filter baru,
 *   dan halaman tambahan yang sudah dimuat dibuang karena `key`-nya tidak cocok lagi.
 */
export function useTransactionList(filters: TransactionListFilters, firstPage: TransactionFirstPage) {
  const router = useRouter();
  const [isFiltering, startFiltering] = useTransition();
  const [isLoadingMore, startLoadingMore] = useTransition();
  const [loaded, setLoaded] = useState<LoadedPages | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Berubah setiap kali server mengirim halaman pertama yang berbeda (filter berubah, atau ada transaksi baru).
  const key = `${transactionsHref(filters)}|${firstPage.rows.map((row) => row.id).join(",")}`;
  const current: LoadedPages = loaded?.key === key ? loaded : { key, ...firstPage };

  function setFilters(change: Partial<TransactionListFilters>) {
    setError(null);
    startFiltering(() => router.replace(transactionsHref({ ...filters, ...change }), { scroll: false }));
  }

  function loadMore() {
    const cursor = current.nextCursor;
    if (!cursor) return;
    startLoadingMore(async () => {
      const result = await loadMoreTransactionsAction(filters, cursor);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setError(null);
      const seen = new Set(current.rows.map((row) => row.id));
      setLoaded({ key, rows: [...current.rows, ...result.rows.filter((row) => !seen.has(row.id))], nextCursor: result.nextCursor });
    });
  }

  return { rows: current.rows, hasMore: current.nextCursor !== null, loadMore, isLoadingMore, error, setFilters, isFiltering };
}

/**
 * Isi kotak pencarian. Nilainya dikirim ke URL 300 ms setelah user berhenti mengetik,
 * supaya backend tidak menerima satu request untuk setiap huruf.
 *
 * Layar Transaksi memasang dua kotak pencarian sekaligus (daftar mobile dan tabel desktop, salah satunya
 * disembunyikan CSS). Saat `q` di URL berubah, kotak yang tidak sedang diketik ikut menyalin nilai baru itu.
 * Tanpa ini, kotak yang tersembunyi masih kosong dan akan mengirim "" ke URL, sehingga pencarian terhapus lagi.
 */
export function useSearchQuery(committed: string, commit: (q: string) => void) {
  const [query, setQuery] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);

  if (lastCommitted !== committed) {
    // Pola "menyesuaikan state saat render" dari dokumentasi React, tanpa useEffect tambahan.
    setLastCommitted(committed);
    // Kotak yang sedang diketik (isinya sudah beda dari nilai URL sebelumnya) tidak ditimpa.
    if (query.trim() === lastCommitted) setQuery(committed);
  }

  useEffect(() => {
    const next = query.trim();
    if (next === committed) return;
    const timer = setTimeout(() => commit(next), 300);
    return () => clearTimeout(timer);
  }, [query, committed, commit]);

  return [query, setQuery] as const;
}
