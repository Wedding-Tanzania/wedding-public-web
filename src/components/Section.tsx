import type { ReactNode } from 'react';

interface SectionProps {
  tone?: 'ivory' | 'paper' | 'cream' | 'ink';
  children: ReactNode;
  className?: string;
}

const toneMap: Record<NonNullable<SectionProps['tone']>, string> = {
  ivory: 'bg-linen text-ink-1',
  paper: 'bg-paper text-ink-1',
  cream: 'bg-herb-50 text-ink-1',
  ink: 'bg-herb-900 text-herb-100',
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
  const titleColor = tone === 'dark' ? 'text-herb-900' : 'text-herb-50';
  const bodyColor = tone === 'dark' ? 'text-ink-2' : 'text-herb-200';
  const eyebrowToneClass = tone === 'light' ? 'eyebrow on-dark' : 'eyebrow';
  const wrapClass =
    `${center ? 'text-center max-w-3xl mx-auto flex flex-col items-center' : 'max-w-3xl'} mb-16`;
  return (
    <div className={wrapClass}>
      <div className={eyebrowToneClass}>{eyebrow}</div>
      <h2
        className={`mt-4 font-sans font-light text-[clamp(2.2rem,4.5vw,3.5rem)] leading-tight tracking-tight ${titleColor}`}
      >
        {title}
      </h2>
      {body !== undefined && (
        <p className={`mt-6 font-sans text-lg leading-relaxed ${bodyColor}`}>{body}</p>
      )}
    </div>
  );
}
