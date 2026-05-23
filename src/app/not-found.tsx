import Link from 'next/link';
import Image from 'next/image';
import { Section } from '@/components/Section';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main>
      <Section tone="ivory" className="!pt-32 !pb-24">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div>
            <div className="eyebrow">Error 404</div>
            <h1 className="mt-4 font-sans font-light text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] tracking-tight text-herb-900">
              That page
              <br />
              <em className="not-italic font-extrabold text-herb-600">slipped away.</em>
            </h1>
            <p className="mt-6 font-sans text-xl text-ink-2 leading-relaxed max-w-md">
              The link may be old, the URL may be off by a letter, or the page may have moved.
              Either way, we have you covered.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/" className="btn btn-primary">
                Back to home
              </Link>
              <Link href="/vendors" className="btn btn-outline">
                Browse vendors
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-md mx-auto lg:max-w-none">
            <Image
              src="/illustrations/storyset_404.svg"
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
