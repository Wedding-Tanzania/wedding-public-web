'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/components/Section';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Once a logger is wired up, send this to it.
    // eslint-disable-next-line no-console
    console.error('[public-web] route error:', error);
  }, [error]);

  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-24">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div>
            <div className="eyebrow">Something went wrong</div>
            <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
              Hiccup on
              <br />
              <em className="not-italic font-extrabold text-herb-600">our side.</em>
            </h1>
            <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed max-w-md">
              The page failed to load. Our team has been notified. Try again, or head back home.
            </p>
            {error.digest !== undefined && (
              <p className="mt-3 font-mono text-xs text-ink-3">Ref: {error.digest}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-10">
              <button type="button" onClick={() => reset()} className="btn btn-primary">
                Try again
              </button>
              <Link href="/" className="btn btn-outline">
                Back to home
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-md mx-auto lg:max-w-none">
            <Image
              src="/illustrations/storyset_server_error.svg"
              alt=""
              width={640}
              height={480}
              priority
              className="w-full h-auto"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
