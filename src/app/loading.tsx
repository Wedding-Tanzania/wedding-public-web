export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <section
        className="relative overflow-hidden px-6 lg:px-12"
        style={{
          background:
            'radial-gradient(ellipse at top, var(--w-herb-50), var(--w-linen) 60%)',
          padding: '120px 0 140px',
        }}
      >
        <div className="max-w-wrap mx-auto">
          <div className="h-7 w-56 rounded-full bg-herb-100 animate-pulse" />
          <div className="mt-8 h-16 w-3/4 rounded-md bg-herb-100/70 animate-pulse" />
          <div className="mt-4 h-16 w-2/3 rounded-md bg-herb-100/70 animate-pulse" />
          <div className="mt-8 h-5 w-2/3 max-w-2xl rounded-md bg-herb-100/60 animate-pulse" />
          <div className="mt-3 h-5 w-1/2 max-w-2xl rounded-md bg-herb-100/60 animate-pulse" />
          <div className="flex flex-wrap gap-4 mt-10">
            <div className="h-11 w-40 bg-herb-200/70 animate-pulse" />
            <div className="h-11 w-44 bg-herb-100/70 border border-herb-200/60 animate-pulse" />
          </div>
        </div>
      </section>
      <span className="sr-only">Loading content, please wait.</span>
    </main>
  );
}
