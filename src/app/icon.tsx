import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4F6A42 0%, #2A3A24 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F2F5EE',
          fontFamily: 'sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        W
      </div>
    ),
    { ...size },
  );
}
