import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4F6A42 0%, #2A3A24 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F2F5EE',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
          W
        </div>
        <div
          style={{
            fontSize: 14,
            marginTop: 12,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#A8BC97',
          }}
        >
          Wedding
        </div>
      </div>
    ),
    { ...size },
  );
}
