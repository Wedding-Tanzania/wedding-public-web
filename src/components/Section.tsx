import type { ReactNode } from 'react';

interface SectionProps {
  tone?: 'ivory' | 'paper' | 'cream' | 'ink';
  children: ReactNode;
  className?: string;
}

const toneMap: Record<NonNullable<SectionProps['tone']>, string> = {
  ivory: 'bg-ivory text-ink-1',
  paper: 'bg-paper text-ink-1',
  cream: 'bg-blush-50 text-ink-1',
  ink: 'bg-blush-900 text-blush-100',
};

export function Section({ tone = 'paper', children, className = '' }: SectionProps) {
  return (
    <section className={`py-24 lg:py-28 px-6 lg:px-12 ${toneMap[tone]} ${className}`}>
      <div className="max-w-wrap mx-auto">{children}</div>
    </section>
  );
}

interface HeadProps {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  center?: boolean;
  tone?: 'dark' | 'light';
}

export function SectionHead({ eyebrow, title, body, center = true, tone = 'dark' }: HeadProps) {
  const titleColor = tone === 'dark' ? 'text-blush-900' : 'text-blush-50';
  const bodyColor = tone === 'dark' ? 'text-ink-2' : 'text-blush-200';
  const ornamentColor = tone === 'dark' ? 'text-blush-600' : 'text-blush-300';
  return (
    <div className={`${center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'} mb-16`}>
      <div className={`ornament ${ornamentColor} ${center ? 'justify-center' : ''}`}>
        — {eyebrow} —
      </div>
      <h2
        className={`mt-4 font-display font-light text-[clamp(2.2rem,4.5vw,3.5rem)] leading-tight tracking-tight ${titleColor}`}
      >
        {title}
      </h2>
      {body !== undefined && (
        <p className={`mt-6 font-display italic text-xl leading-relaxed ${bodyColor}`}>{body}</p>
      )}
    </div>
  );
}
