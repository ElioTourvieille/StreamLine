export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-4xl font-bold tracking-tight">StreamLine</h1>
      <p className="text-lg text-neutral-500">
        The project hub for digital studios and their clients.
      </p>
      <div className="flex gap-4 text-sm text-neutral-400">
        <span className="rounded-full border px-3 py-1">Next.js 15</span>
        <span className="rounded-full border px-3 py-1">NestJS API</span>
        <span className="rounded-full border px-3 py-1">DynamoDB</span>
      </div>
    </main>
  )
}
