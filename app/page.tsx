export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Marketing</h1>
      <p className="max-w-xl text-center text-lg text-foreground/70">
        Стартовая страница приложения. Отредактируйте{" "}
        <code className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-sm">
          app/page.tsx
        </code>{" "}
        — изменения подхватятся автоматически.
      </p>
      <div className="flex gap-3">
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
        >
          Документация Next.js
        </a>
        <a
          href="https://tailwindcss.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
        >
          Документация Tailwind
        </a>
      </div>
    </main>
  );
}
