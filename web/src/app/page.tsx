export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_10%_20%,#fff8e7_0%,#f7efe2_45%,#f6f1ea_100%)] text-zinc-900">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-6 py-16 md:px-10 md:py-20">
        <section className="space-y-6">
          <p className="inline-flex rounded-full border border-zinc-300 bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-zinc-700 uppercase">
            Rekkoe • Vision Starter
          </p>
          <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            Conversation is the product.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-700">
            Rekkoe helps people discover places, routines, and experiences by
            talking directly with locals and experts in real time.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-300 bg-white/80 p-5 shadow-sm">
            <h2 className="text-base font-semibold">Chat-First Discovery</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Personalized recommendations through live conversation instead of
              static search results.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-300 bg-white/80 p-5 shadow-sm">
            <h2 className="text-base font-semibold">Local Knowledge Network</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Connect explorers with locals, enthusiasts, and professionals who
              have real context.
            </p>
          </article>
          <article className="rounded-2xl border border-zinc-300 bg-white/80 p-5 shadow-sm">
            <h2 className="text-base font-semibold">From Chat to Experience</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              Convert conversations into guided or self-guided experiences with
              seamless booking and payments.
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-300 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Suggested first build slices</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            <li>Authentication + verified profiles (explorers and locals)</li>
            <li>Conversation inbox and real-time chat thread UI</li>
            <li>Experience proposal card generated from chat</li>
            <li>Booking flow with schedule and payment handoff</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
