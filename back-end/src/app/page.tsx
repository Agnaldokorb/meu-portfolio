export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Portfolio API
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal">
            API Portfolio Agnaldo Korb
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Servico em Next.js para sincronizar repositorios publicos do GitHub
            com MySQL e entregar JSON para o portfolio estatico.
          </p>
        </div>

        <ul className="grid gap-3 text-sm text-slate-200">
          <li className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            GET /api/health
          </li>
          <li className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            GET /api/sync-github
          </li>
          <li className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            GET /api/repositories
          </li>
          <li className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            POST /api/github-webhook
          </li>
        </ul>
      </section>
    </main>
  );
}
