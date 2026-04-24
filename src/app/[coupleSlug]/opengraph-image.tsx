import { ImageResponse } from 'next/og';
import type { Couple } from '@wedding/shared-types';
import { apiGet } from '@/lib/api';

export const runtime = 'edge';
export const alt = 'Wedding.co.tz couple page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: { coupleSlug: string } }) {
  let couple: Couple | null = null;
  try {
    const data = await apiGet<{ couple: Couple }>(`/public/couples/${params.coupleSlug}`);
    couple = data.couple;
  } catch {
    couple = null;
  }

  const title =
    couple !== null
      ? `${couple.partnerAFirstName} & ${couple.partnerBFirstName}`
      : 'Wedding.co.tz';
  const subtitle =
    couple !== null
      ? new Date(couple.weddingDate).toLocaleDateString('en-TZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : "Tanzania's wedding planning platform";

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #A80754 0%, #1D2040 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8, letterSpacing: 4 }}>WEDDING.CO.TZ</div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 24, textAlign: 'center' }}>
          {title}
        </div>
        <div style={{ fontSize: 36, marginTop: 24, opacity: 0.9 }}>{subtitle}</div>
      </div>
    ),
    { ...size },
  );
}
