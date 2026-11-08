import Image from 'next/image';

/**
 * A real app screen (captured on the iPhone simulator for the store listing)
 * in a plain CSS phone frame. Screens live in public/marketing/screens at
 * 660 x 1434.
 */
export function PhoneShot({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[36px] bg-ink-1 p-[7px] shadow-[0_30px_70px_rgba(26,37,22,0.35)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={660}
        height={1434}
        sizes="(min-width: 1024px) 230px, 180px"
        className="block h-auto w-full rounded-[30px]"
      />
    </div>
  );
}
