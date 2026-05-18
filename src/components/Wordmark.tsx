export function Wordmark({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const colorMain = tone === 'dark' ? 'text-herb-800' : 'text-paper';
  const colorKicker = tone === 'dark' ? 'text-ink-3' : 'text-herb-100';
  return (
    <div className="flex items-baseline gap-4">
      <div className="grid place-items-center w-12 h-12 rounded-lg bg-gradient-to-br from-herb-400 to-herb-600 shadow-brand">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <circle cx="13" cy="16" r="8" stroke="#fff" strokeWidth="2" fill="none" />
          <circle cx="19" cy="16" r="8" stroke="#fff" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div>
        <div className={`font-sans text-[28px] font-normal leading-none ${colorMain}`}>
          Wedding
        </div>
        <div
          className={`text-[10px] uppercase tracking-widest font-medium ${colorKicker}`}
        >
          by Lockwood
        </div>
      </div>
    </div>
  );
}
