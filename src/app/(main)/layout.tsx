import { MainNav } from "./_components/main-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <span className="font-semibold">Personal Finance</span>
          <MainNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
