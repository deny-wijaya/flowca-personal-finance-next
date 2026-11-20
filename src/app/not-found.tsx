import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <Link href="/dashboard" className="mt-4 inline-block text-sm underline">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
