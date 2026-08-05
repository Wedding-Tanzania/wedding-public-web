import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Wedding by Lockwood: East Africa\'s wedding planning platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4F6A42 0%, #2A3A24 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'Manrope, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,188,151,0.35), transparent 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '20px',
            color: '#E2E9DA',
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.02em' }}>Wedding</div>
          <div style={{ fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7 }}>
            by Lockwood
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#A8BC97',
              marginBottom: 28,
            }}
          >
            East Africa &middot; Sage v0.3
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#F2F5EE',
              maxWidth: '900px',
            }}
          >
            A garden, two families, and every shilling accounted for.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            color: '#A8BC97',
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div>wedding.co.tz</div>
          <div>Plan &middot; Book &middot; Celebrate</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
