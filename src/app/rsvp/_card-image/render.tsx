import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactNode } from 'react';
import { cardDate, cardDesignFor, partyLine, type InvitationCardView } from '@/lib/card';
import { cardKindForSeats, cardKindLabel, shownSeats, type CardKind, type VenueRow } from '@/lib/invite/wcz';
import { qrSvg } from '@/lib/qr';

/** 4:5 portrait: what WhatsApp, Instagram and a phone's photo app all show whole. */
export const CARD_IMAGE_SIZE = { width: 1080, height: 1350 };

const FONT_DIR = join(process.cwd(), 'src/app/rsvp/_card-image/fonts');
// The kind pill is mono on every card; the template renderer already ships JetBrains Mono.
const MONO_FONT = join(process.cwd(), 'src/app/_invite-card/fonts/jetbrains-mono-latin-700-normal.woff');

async function fonts() {
  const [serif600, serif700, sans400, sans600, mono700] = await Promise.all([
    readFile(join(FONT_DIR, 'cormorant-garamond-latin-600-normal.woff')),
    readFile(join(FONT_DIR, 'cormorant-garamond-latin-700-normal.woff')),
    readFile(join(FONT_DIR, 'manrope-latin-400-normal.woff')),
    readFile(join(FONT_DIR, 'manrope-latin-600-normal.woff')),
    readFile(MONO_FONT),
  ]);
  return [
    { name: 'Serif', data: serif600, weight: 600 as const, style: 'normal' as const },
    { name: 'Serif', data: serif700, weight: 700 as const, style: 'normal' as const },
    { name: 'Sans', data: sans400, weight: 400 as const, style: 'normal' as const },
    { name: 'Sans', data: sans600, weight: 600 as const, style: 'normal' as const },
    { name: 'Mono', data: mono700, weight: 700 as const, style: 'normal' as const },
  ];
}

/**
 * The couple's photo as a data URL, or nothing. The renderer cannot decode
 * WEBP, and a photo that fails to load must not take the whole card with it,
 * so anything other than a JPEG or PNG that arrives quickly is left off.
 */
async function photoData(url: string | undefined): Promise<string | null> {
  if (url === undefined) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:${type.split(';')[0]};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

// flexShrink 0 everywhere: when content runs long the renderer shrinks
// items into each other instead of overflowing, and text ends up overlapping.
function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: 'flex', flexShrink: 0, ...style }}>{children}</div>;
}
function Col({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, ...style }}>{children}</div>;
}

/**
 * A line of venue text that fits its column is drawn as a plain centred
 * line: the renderer leaves a clamped line that fits flush left. Text that
 * runs over keeps the clamp, and fills the width anyway. 0.56 of the size
 * per character errs on long for Manrope.
 */
const fitsLine = (text: string, size: number, width: number) => text.length * size * 0.56 <= width;

/** The church and the hall: two columns (or one), label with time, name on two lines, address on one. */
function Venues({ rows, ink, accent, soft }: { rows: VenueRow[]; ink: string; accent: string; soft: string }) {
  const colW = rows.length > 1 ? (880 - 73) / 2 : 880;
  const cols: ReactNode[] = [];
  rows.forEach((r, i) => {
    if (i > 0) cols.push(<div key="rule" style={{ display: 'flex', width: 1, alignSelf: 'stretch', margin: '2px 36px', background: soft }} />);
    const name: CSSProperties = fitsLine(r.name, 30, colW)
      ? { display: 'flex', justifyContent: 'center', width: '100%' }
      : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' };
    const addr: CSSProperties = fitsLine(r.addr, 24, colW)
      ? { display: 'flex', justifyContent: 'center', width: '100%' }
      : { display: 'block', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
    cols.push(
      <Col key={r.key} style={{ flex: 1, flexShrink: 1, minWidth: 0, alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 20, letterSpacing: 4.4, color: accent, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
          {r.time ? `${r.label} · ${r.time}` : r.label}
        </div>
        <div style={{ ...name, marginTop: 6, fontFamily: 'Sans', fontSize: 30, fontWeight: 600, lineHeight: 1.15, color: ink, textAlign: 'center', maxHeight: 72 }}>{r.name}</div>
        {r.addr ? (
          <div style={{ ...addr, marginTop: 4, fontFamily: 'Sans', fontSize: 24, lineHeight: 1.35, color: ink, opacity: 0.7, textAlign: 'center', maxHeight: 33, overflow: 'hidden' }}>{r.addr}</div>
        ) : null}
      </Col>,
    );
  });
  return (
    <Row style={{ width: 880, alignItems: 'flex-start', justifyContent: 'center', marginTop: 10 }}>
      {cols}
    </Row>
  );
}

/**
 * `kind` is the guest's SINGLE / DOUBLE from the RSVP payload. The card view
 * itself does not carry one, so without it the kind follows the seats, the
 * same default the API gives a guest nobody chose a kind for. `venues` are
 * the church and the hall (see legacyVenues); without them the card names
 * the wedding's one venue as it always did.
 */
export async function renderCardImage(card: InvitationCardView, opts: { kind?: CardKind; venues?: VenueRow[] } = {}): Promise<ImageResponse> {
  const kind = opts.kind ?? cardKindForSeats(card.partyAllowed);
  const venues = opts.venues;
  const hv = venues !== undefined && venues.length > 0;
  // The banner grows upward with its text, so a name on three lines would run
  // it into the venue lines above; smaller steps keep long names on two.
  const gl = card.guestName.length;
  const guestSize = gl > 46 ? 32 : gl > 30 ? 36 : 40;
  const design = cardDesignFor(card.templateKey);
  const { paper, ink, accent, soft } = design.palette;
  const display = design.display === 'serif' ? 'Serif' : 'Sans';
  const date = cardDate(card.weddingDate);
  // A DOUBLE card admits two at the least, whatever seat count was saved.
  const party = partyLine(shownSeats(kind, card.partyAllowed));
  const [qr, photo] = await Promise.all([qrSvg(card.rsvpUrl, ink), photoData(card.photoUrl)]);
  const qrSrc = `data:image/svg+xml;base64,${Buffer.from(qr).toString('base64')}`;

  const eyebrow = (text: string) => (
    <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 26, letterSpacing: 7, color: accent, textTransform: 'uppercase' }}>
      {text}
    </div>
  );

  const names = (
    <Col style={{ alignItems: 'center', fontFamily: display, color: ink, lineHeight: 1.02 }}>
      <div style={{ display: 'flex', fontSize: 100, fontWeight: 700 }}>{card.partnerA}</div>
      <div style={{ display: 'flex', fontSize: 54, color: accent, fontWeight: 600 }}>&amp;</div>
      <div style={{ display: 'flex', fontSize: 100, fontWeight: 700 }}>{card.partnerB}</div>
    </Col>
  );

  const details = (
    <Col style={{ alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 26, letterSpacing: 6, color: accent, textTransform: 'uppercase' }}>
        {date.weekday}
      </div>
      <div style={{ display: 'flex', fontFamily: display, fontSize: 54, fontWeight: 700, color: ink }}>
        {`${date.day} ${date.month} ${date.year}`}
      </div>
      {venues !== undefined ? (
        hv ? <Venues rows={venues} ink={ink} accent={accent} soft={soft} /> : null
      ) : (
        <>
          {card.venueName !== undefined && (
            <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 36, fontWeight: 600, color: ink, marginTop: 8 }}>
              {card.venueName}
            </div>
          )}
          {card.venueAddress !== undefined && (
            <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 30, color: ink, opacity: 0.7 }}>{card.venueAddress}</div>
          )}
        </>
      )}
    </Col>
  );

  const pass = (
    <Row style={{ alignItems: 'center', gap: 36, background: '#FFFFFF', border: `3px solid ${soft}`, borderRadius: 24, padding: 26, width: 880 }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={qrSrc} width={196} height={196} />
      <Col style={{ gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 22, letterSpacing: 5, color: accent, textTransform: 'uppercase' }}>
          Invitation for
        </div>
        <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: guestSize, fontWeight: 600, color: ink }}>{card.guestName}</div>
        <div style={{ display: 'flex', fontFamily: 'Sans', fontSize: 30, color: ink, opacity: 0.75 }}>
          {`Card ${card.cardNumber}${party !== null ? ` · ${party}` : ''}`}
        </div>
        {/* Same corner as the template cards: the pill on the gate line, at the banner's right edge. */}
        <Row style={{ alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', flex: 1, minWidth: 0, fontFamily: 'Sans', fontSize: 24, color: ink, opacity: 0.6 }}>Show this at the gate</div>
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              height: 44,
              padding: '0 20px',
              alignItems: 'center',
              borderRadius: 22,
              backgroundColor: 'rgba(48,48,48,0.86)',
              fontFamily: 'Mono',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3.6,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            {cardKindLabel(kind)}
          </div>
        </Row>
      </Col>
    </Row>
  );

  let body: ReactNode;
  if (design.layout === 'coast') {
    body = (
      <Col style={{ width: '100%', height: '100%', alignItems: 'center' }}>
        {/* A shorter photo strip with venue lines, so they keep clear of the pass. */}
        <Row style={{ width: '100%', height: hv ? 260 : 340, background: soft, overflow: 'hidden' }}>
          {photo !== null && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={photo} width={1080} height={hv ? 260 : 340} style={{ objectFit: 'cover' }} />
          )}
        </Row>
        <Col style={{ alignItems: 'center', gap: hv ? 16 : 20, padding: hv ? '34px 100px 0' : '40px 100px 0' }}>
          {eyebrow('Karibu kwenye harusi yetu')}
          {names}
          <div style={{ display: 'flex', width: 140, height: 3, background: accent }} />
          {details}
        </Col>
        <Row style={{ marginTop: 'auto', marginBottom: 56 }}>{pass}</Row>
      </Col>
    );
  } else if (design.layout === 'bold') {
    body = (
      <Col style={{ width: '100%', height: '100%', padding: 44 }}>
        {/* Tighter, with a smaller medallion, when the venue lines are on the card. */}
        <Col style={{ flex: 1, alignItems: 'center', border: `14px solid ${accent}`, borderRadius: 12, padding: hv ? '40px 40px 36px' : '56px 40px 48px', gap: hv ? 18 : 26 }}>
          <Row style={{ width: hv ? 150 : 180, height: hv ? 150 : 180, borderRadius: 90, border: `5px solid ${accent}`, background: soft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {photo !== null ? (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img src={photo} width={hv ? 150 : 180} height={hv ? 150 : 180} style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', fontFamily: display, fontSize: 72, fontWeight: 700, color: accent }}>
                {`${card.partnerA.charAt(0)}${card.partnerB.charAt(0)}`}
              </div>
            )}
          </Row>
          {eyebrow('You are invited')}
          {names}
          {details}
          <Row style={{ marginTop: 'auto' }}>{pass}</Row>
        </Col>
      </Col>
    );
  } else {
    body = (
      <Col style={{ width: '100%', height: '100%', alignItems: 'center', padding: '64px 100px 56px', gap: 20 }}>
        {eyebrow('Together with their families')}
        {photo !== null && (
          <Row style={{ width: 240, height: 240, borderRadius: 120, border: `8px solid ${soft}`, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={photo} width={240} height={240} style={{ objectFit: 'cover' }} />
          </Row>
        )}
        {names}
        <div style={{ display: 'flex', fontFamily: display, fontSize: 38, fontWeight: 600, color: ink, opacity: 0.8 }}>
          request the pleasure of your company
        </div>
        {details}
        <Row style={{ marginTop: 'auto' }}>{pass}</Row>
      </Col>
    );
  }

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: paper }}>{body}</div>
    ),
    {
      ...CARD_IMAGE_SIZE,
      fonts: await fonts(),
      headers: {
        // A guest's card changes when the couple edits the design; keep caches short.
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Robots-Tag': 'noindex',
      },
    },
  );
}
