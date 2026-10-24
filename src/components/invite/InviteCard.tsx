import { Children, Fragment, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { ICON_PATHS, isIconName } from '@/lib/invite/icons';
import { placeSlot, type PlacedPhoto } from '@/lib/invite/photo';
import type { QrPath } from '@/lib/invite/qr';
import {
  DRESS_BANDS,
  DRESS_STACK_PER_ROW,
  STR,
  alpha,
  calendar,
  cardKindLabel,
  dressChips,
  dressLift,
  fit,
  fmtDate,
  mix,
  shownSeats,
  templateFor,
  theme,
  venueBoxAt,
  venueRows,
  words,
  type CardKind,
  type InviteDesign,
  type Lang,
  type SlotKey,
  type Theme,
  type VenueRow,
} from '@/lib/invite/wcz';

/**
 * The 23 card templates and five gate-pass styles, as one component that
 * renders the same 1080 x 1350 card in the browser (scaled by ScaledCard)
 * and in next/og for the PNG guests download and WhatsApp shows.
 *
 * The image renderer (satori) reads a subset of CSS, so this file keeps to it:
 * flex layout only (no grid), an explicit display:flex on every element with
 * more than one child, colours mixed ahead of time with wcz mix() (no
 * color-mix), photos as absolutely positioned <img> boxes from the crop math
 * (no background-size), the QR as an <svg><path/>, letter-spacing in px, and
 * SVG for the vinyl grooves and dotted rings that CSS would draw with
 * repeating gradients and dotted borders.
 */

export interface CardGuest {
  name: string;
  seats: number;
  cardNumber: string;
  /** SINGLE or DOUBLE on the pass; absent (an older API) reads as single. */
  kind?: CardKind;
}

export interface CardFonts {
  sans: string;
  mono: string;
}

export const WEB_FONTS: CardFonts = {
  sans: "var(--font-manrope), 'Manrope', system-ui, sans-serif",
  mono: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
};
export const OG_FONTS: CardFonts = { sans: 'Manrope', mono: 'JetBrains Mono' };

export interface InviteCardProps {
  design: InviteDesign;
  /** Template to draw; defaults to the design's own. */
  tpl?: string;
  lang: Lang;
  guest: CardGuest | null;
  qr: QrPath;
  /** The page hero: 1080 x 1010, without the gate pass. */
  cover?: boolean;
  fonts?: CardFonts;
  /** Photo sources by original URL, for the image renderer (data URLs). Missing means leave the slot tinted. */
  photoSrc?: (src: string) => string | null;
  /** Draw the add-photo icon in empty slots (the couple's editor). */
  placeholders?: boolean;
  /** Browser-only niceties the image renderer would ignore or reject. */
  web?: boolean;
}

export const CARD_W = 1080;
export const CARD_H = 1350;
export const COVER_H = 1010;
/**
 * Height of the SINGLE / DOUBLE pill. It sits on the pass's last line, so
 * the bodies above no longer need to stop short of it; several still end a
 * little higher than the design because they once did, and moving them now
 * would shift every card couples have already sent.
 */
const KIND_PILL_H = 44;

/**
 * Fragments, unwrapped into plain lists. The image renderer lays a fragment
 * out as a box of its own, which breaks absolute positioning and column
 * layout; the browser does not care either way.
 */
function flat(node: ReactNode, prefix = 'f'): ReactNode[] {
  const out: ReactNode[] = [];
  Children.toArray(node).forEach((child, i) => {
    const key = `${prefix}.${i}`;
    if (isValidElement(child) && child.type === Fragment) {
      out.push(...flat((child as ReactElement<{ children?: ReactNode }>).props.children, key));
    } else if (isValidElement(child)) {
      out.push(cloneElement(child, { key }));
    } else {
      out.push(child);
    }
  });
  return out;
}

function Icon({ name, size, color }: { name: string; size: number; color: string }) {
  const d = isIconName(name) ? ICON_PATHS[name] : ICON_PATHS.Schedule;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'flex', flexShrink: 0 }}>
      <path d={d} fill={color} />
    </svg>
  );
}

/** Concentric grooves: what repeating-radial-gradient draws in the design. */
function Vinyl({ size, groove }: { size: number; groove: number }) {
  const r = size / 2;
  const rings: ReactNode[] = [];
  for (let i = groove * 1.5, k = 0; i < r; i += groove * 2, k++) {
    rings.push(<circle key={k} cx={r} cy={r} r={i} fill="none" stroke="#1E2B1A" strokeWidth={groove} />);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'flex', position: 'absolute', left: 0, top: 0 }}>
      <circle cx={r} cy={r} r={r} fill="#10170E" />
      {rings}
    </svg>
  );
}

/** A dotted ring: the design's `border: dotted`, drawn as dots. */
function DottedRing({ size, width, color }: { size: number; width: number; color: string }) {
  const r = (size - width) / 2;
  const n = Math.max(12, Math.round((2 * Math.PI * r) / (width * 2)));
  const dots: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    dots.push(<circle key={i} cx={size / 2 + r * Math.cos(a)} cy={size / 2 + r * Math.sin(a)} r={width / 2} fill={color} />);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'flex', position: 'absolute', left: 0, top: 0 }}>
      {dots}
    </svg>
  );
}

export function InviteCard(props: InviteCardProps) {
  const { design: d, lang, guest, qr, cover = false, placeholders = false, web = false } = props;
  const fonts = props.fonts ?? WEB_FONTS;
  const t = templateFor(props.tpl ?? d.tpl);
  const th: Theme = theme(d, t.id);
  const S = STR[lang];
  const w = words(d, lang);
  const dt = fmtDate(d.date, lang);
  const a = d.names.a || '';
  const b = d.names.b || '';
  const ini = { a: (a[0] ?? '').toUpperCase(), b: (b[0] ?? '').toUpperCase() };
  const g: CardGuest = guest ?? { name: S.guestFallback, seats: 1, cardNumber: `${d.code}-000` };
  // A DOUBLE card admits two at the least, whatever seat count was saved.
  const seats = S.seats(shownSeats(g.kind, g.seats));
  const no = g.cardNumber;
  const H = cover ? COVER_H : CARD_H;
  // The church and the hall. Not on the page hero (the page has its own
  // venue section below it); when there are none the bodies keep the room.
  const vrows = cover ? [] : venueRows(d, lang);
  const hv = vrows.length > 0;
  // The dress-code colours in the guest banner. With any, the banner grows
  // by `lift` and everything above it moves up; with none, nothing changes.
  const chips = cover ? [] : dressChips(d, lang);
  const hasDress = chips.length > 0;
  const lift = cover ? 0 : dressLift(t.pass, chips.length);
  /** The compact body: made for the venue lines, and used for the dress row too. */
  const tight = hv || hasDress;
  /** Venue lines and a dress row together: the bodies give up a little more. */
  const sq = hv && hasDress;
  const vb = venueBoxAt(t.id, lift);
  /** "Jumamosi · 5 Desemba 2026", skipping whatever is empty, so no stray dot. */
  const dot = (...parts: (string | undefined)[]) =>
    parts
      .map((x) => (x ?? '').trim())
      .filter((x) => x !== '')
      .join(' · ');
  const tm = (d.ceremony.time || '').trim();
  /** No venue named but a start time set: the time still goes on the card, alone. */
  const loneTime = !hv && tm !== '';

  const fo = { w: th.nw, upper: th.upper };
  const pad = t.fit.pad ?? 0;
  const stText = a.length >= b.length + pad ? a : b + 'xx'.slice(0, pad);
  const gl = g.name.length;
  const fs = {
    st: t.fit.st ? fit(stText, t.fit.st[0], t.fit.st[1], fo) : 100,
    ol: t.fit.ol ? fit(`${a} & ${b}`, t.fit.ol[0], t.fit.ol[1], fo) : 80,
    // The smallest steps keep names up to about 80 characters on two lines,
    // so the gate line with the kind pill stays inside the banner.
    guest: gl > 72 ? 26 : gl > 64 ? 28 : gl > 46 ? 32 : gl > 34 ? 36 : gl > 24 ? 42 : 48,
    // Tighter rows for those names too, so a name that still wraps to three
    // lines leaves the pill clear of the banner's bottom edge.
    passGap: gl > 46 ? 6 : 10,
    guestS: gl > 46 ? 24 : gl > 24 ? 28 : 32,
    verse: w.verse.length > 120 ? 36 : w.verse.length > 70 ? 42 : 50,
  };

  // Colours, mixed once.
  const ink = (p: number) => mix(th.ink, p, th.bg);
  const inkP = (p: number) => mix(th.ink, p, th.panel);
  const pink = (p: number) => mix(th.pink, p, th.panel);
  const accT = (p: number) => mix(th.accent, p, th.bg);
  const sans = fonts.sans;
  const lf = th.labels === 'sans' ? fonts.sans : fonts.mono;

  const box = (style: CSSProperties): CSSProperties => ({ display: 'flex', ...style });
  const abs = (style: CSSProperties): CSSProperties => ({ display: 'flex', position: 'absolute', ...style });
  const col = (style: CSSProperties): CSSProperties => ({ display: 'flex', flexDirection: 'column', ...style });
  const label = (size: number, em: number, color: string, extra: CSSProperties = {}): CSSProperties => ({
    display: 'flex',
    fontFamily: lf,
    fontSize: size,
    letterSpacing: Math.round(size * em * 10) / 10,
    textTransform: 'uppercase',
    color,
    ...extra,
  });
  const name = (size: number, lh: number, extra: CSSProperties = {}): CSSProperties => ({
    display: 'flex',
    fontSize: size,
    fontWeight: th.nw,
    textTransform: th.upper ? 'uppercase' : 'none',
    letterSpacing: Math.round(size * (th.upper ? 0.08 : -0.025) * 10) / 10,
    lineHeight: lh,
    ...extra,
  });
  const text = (size: number, color: string, extra: CSSProperties = {}): CSSProperties => ({
    display: 'flex',
    fontSize: size,
    color,
    ...extra,
  });
  const rule = (style: CSSProperties) => <div style={abs(style)} />;
  /** "Andrew & Franciana" on one line, the ampersand light and in the accent. */
  const oneLine = (size: number, lh: number, extra: CSSProperties = {}, amp: string = th.accent, ampW = 200) => (
    <div style={{ ...name(size, lh, extra), whiteSpace: 'nowrap', alignItems: 'baseline', gap: Math.round(size * 0.24) }}>
      <span>{a}</span>
      <span style={{ fontWeight: ampW, color: amp }}>&amp;</span>
      <span>{b}</span>
    </div>
  );

  const placed = (key: SlotKey): PlacedPhoto | null => {
    const slot = t.slots.find((s) => s.key === key);
    if (slot === undefined) return null;
    const p = placeSlot(d, t.id, slot);
    if (p === null) return null;
    const src = props.photoSrc ? props.photoSrc(p.src) : p.src;
    return src === null ? null : { ...p, src };
  };

  /**
   * A photo slot: tinted ground, the placed image, and (in the editor) the
   * add-photo icon when empty. `ring` draws the design's outline + offset as
   * a separate bordered box, since outlines are not in the renderer.
   */
  const slot = (
    key: SlotKey,
    pos: { left: number; top: number; width: number; height: number },
    opts: {
      radius?: [number, number, number, number];
      tint?: string;
      ring?: { offset: number; width: number; color: string };
      iconSize?: number;
      iconColor?: string;
      shadow?: string;
    } = {},
  ) => {
    const natural = placed(key);
    // A slot drawn smaller than the template's own size (a tight card) keeps the same crop, scaled.
    const k = pos.width / (t.slots.find((x) => x.key === key)?.w ?? pos.width);
    const p: PlacedPhoto | null =
      natural === null || k === 1
        ? natural
        : { ...natural, left: natural.left * k, top: natural.top * k, width: natural.width * k, height: natural.height * k };
    const [tl, tr, br, bl] = opts.radius ?? [0, 0, 0, 0];
    const ring = opts.ring;
    const grow = ring ? ring.offset + ring.width : 0;
    const r = (x: number) => (x > 0 ? x + grow : 0);
    return (
      <>
        {ring && (
          <div
            style={abs({
              left: pos.left - grow,
              top: pos.top - grow,
              width: pos.width + grow * 2,
              height: pos.height + grow * 2,
              border: `${ring.width}px solid ${ring.color}`,
              borderTopLeftRadius: r(tl),
              borderTopRightRadius: r(tr),
              borderBottomRightRadius: r(br),
              borderBottomLeftRadius: r(bl),
            })}
          />
        )}
        <div
          style={abs({
            ...pos,
            overflow: 'hidden',
            backgroundColor: opts.tint ?? accT(22),
            borderTopLeftRadius: tl,
            borderTopRightRadius: tr,
            borderBottomRightRadius: br,
            borderBottomLeftRadius: bl,
            alignItems: 'center',
            justifyContent: 'center',
            ...(opts.shadow ? { boxShadow: opts.shadow } : {}),
          })}
        >
          {p !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.src}
              alt=""
              width={Math.round(p.width)}
              height={Math.round(p.height)}
              style={imgStyle(p)}
            />
          ) : placeholders ? (
            <Icon name="AddPhotoAlternate" size={opts.iconSize ?? 96} color={opts.iconColor ?? th.accBg} />
          ) : null}
        </div>
      </>
    );
  };

  // Tailwind's preflight caps images at their container's width in the
  // browser; the image renderer rejects the override, so it is web only.
  const imgStyle = (p: PlacedPhoto): CSSProperties => ({
    position: 'absolute',
    left: p.left,
    top: p.top,
    width: p.width,
    height: p.height,
    ...(web ? { maxWidth: 'none', maxHeight: 'none' } : {}),
  });

  const centerCol = (style: CSSProperties, children: ReactNode) => (
    <div style={col({ position: 'absolute', alignItems: 'center', textAlign: 'center', ...style })}>{flat(children)}</div>
  );

  const qrBox = (size: number, radius: number, shadow?: string) => (
    <div
      style={box({
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: radius,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        ...(shadow ? { boxShadow: shadow } : {}),
      })}
    >
      <svg viewBox={qr.vb} width={size} height={size} style={{ display: 'flex' }} shapeRendering="crispEdges">
        <path d={qr.d} fill="#1F2A1A" />
      </svg>
    </div>
  );

  /**
   * Whether a line of venue text fits its column, judged generously (Manrope
   * runs about half its size per character; 0.56 errs on long). The image
   * renderer leaves a clamped line that fits flush left even when it should
   * be centred, so a line that fits is drawn as a plain centred line and the
   * clamp is kept for text that runs over (which fills the width anyway).
   */
  const fitsLine = (s: string, size: number, width: number) => s.length * size * 0.56 <= width;
  const fitted = (size: number, lines: number, color: string, ta: 'center' | 'left' | 'right', extra: CSSProperties): CSSProperties => ({
    display: 'flex',
    justifyContent: ta === 'center' ? 'center' : ta === 'right' ? 'flex-end' : 'flex-start',
    width: '100%',
    maxHeight: Math.ceil(size * (lines === 2 ? 1.15 : 1.35) * lines),
    overflow: 'hidden',
    fontSize: size,
    lineHeight: lines === 2 ? 1.15 : 1.35,
    textAlign: ta,
    color,
    ...extra,
  });
  /** A venue name: up to two lines, then an ellipsis. */
  const twoLines = (text: string, size: number, width: number, color: string, ta: 'center' | 'left' | 'right', extra: CSSProperties = {}): CSSProperties =>
    ta !== 'left' && fitsLine(text, size, width)
      ? fitted(size, 2, color, ta, { fontWeight: 500, ...extra })
      : {
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
          fontSize: size,
          fontWeight: 500,
          lineHeight: 1.15,
          textAlign: ta,
          color,
          ...extra,
        };
  /** A venue address: one line, cut with an ellipsis. */
  const oneLineCut = (text: string, size: number, width: number, color: string, ta: 'center' | 'left' | 'right', extra: CSSProperties = {}): CSSProperties =>
    ta !== 'left' && fitsLine(text, size, width)
      ? fitted(size, 1, color, ta, extra)
      : {
          display: 'block',
          width: '100%',
          fontSize: size,
          // Room for descenders: the one line is clipped to its own height.
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: ta,
          color,
          ...extra,
        };

  /**
   * One venue: "KANISA · 10:00" in the template's label style, the name on
   * up to two lines, the address on one. The clamps are what keep a long
   * name inside its box. `width` is the column's, for the fit test.
   */
  const venueText = (
    r: VenueRow,
    c: { label: string; name: string; addr: string },
    fz: [number, number, number],
    align: 'center' | 'left',
    width: number,
    stack: boolean,
  ) => {
    const ta = align === 'center' ? 'center' : 'left';
    return (
      <div
        key={r.key}
        data-venue={r.key}
        // Side by side the columns share the row; stacked, each keeps its own height.
        style={col({ ...(stack ? { width: '100%' } : { flex: 1 }), minWidth: 0, alignItems: align === 'center' ? 'center' : 'flex-start' })}
      >
        <div style={label(fz[0], 0.24, c.label, { lineHeight: 1.2, whiteSpace: 'nowrap' })}>{dot(r.label, r.time)}</div>
        <div style={twoLines(r.name, fz[1], width, c.name, ta, { marginTop: 6 })}>{r.name}</div>
        {r.addr ? <div style={oneLineCut(r.addr, fz[2], width, c.addr, ta, { marginTop: 4 })}>{r.addr}</div> : null}
      </div>
    );
  };

  /**
   * The venue lines in the template's box (wcz VENUE_BOXES): two columns
   * with a hairline between them, or one under the other where the box is
   * narrow. Nothing at all when the design names no venue.
   */
  const venueBand = (c: { label: string; name: string; addr: string; rule: string }) => {
    if (!hv) return null;
    const inside = vb.width - (vb.panel ? 56 : 0);
    const colW = vb.stack || vrows.length === 1 ? inside : (inside - (vb.align === 'center' ? 73 : 60)) / 2;
    const rows = vrows.map((r) => venueText(r, c, vb.fs, vb.align, colW, vb.stack));
    const inner: ReactNode[] = [];
    rows.forEach((r, i) => {
      if (i > 0 && !vb.stack) {
        inner.push(
          vb.align === 'center' ? (
            <div key={`rule${i}`} style={box({ width: 1, alignSelf: 'stretch', flexShrink: 0, margin: '2px 36px', backgroundColor: c.rule })} />
          ) : (
            <div key={`gap${i}`} style={box({ width: 60, flexShrink: 0 })} />
          ),
        );
      }
      inner.push(r);
    });
    return (
      <div
        data-venues={vrows.length}
        style={col({
          position: 'absolute',
          left: vb.left,
          top: vb.top,
          width: vb.width,
          height: vb.height,
          overflow: 'hidden',
          // Stacked rows in a column read from the top; bands and panels centre.
          justifyContent: vb.stack && !vb.panel ? 'flex-start' : 'center',
          ...(vb.panel ? { padding: '24px 28px', borderRadius: 24, backgroundColor: th.panel } : {}),
        })}
      >
        {vb.stack ? (
          <div style={col({ width: '100%', gap: vb.panel ? 14 : 18 })}>{inner}</div>
        ) : (
          <div style={box({ width: '100%', alignItems: 'flex-start', justifyContent: vb.align === 'center' ? 'center' : 'flex-start' })}>{inner}</div>
        )}
      </div>
    );
  };
  /** The usual colours: label in the accent, name in ink, address and hairline muted. */
  const venueInk = { label: th.accBg, name: th.ink, addr: ink(68), rule: ink(18) };

  let body: ReactNode = null;
  switch (t.id) {
    case 't01':
      // Bodies above a pass end by about 940, clear of the pass at 1010; with
      // venue lines (or a dress row) they end by 842, clear of the venue band
      // at 862; with both, by 758, clear of the band raised to 778.
      body = (
        <>
          {centerCol({ left: 90, right: 90, top: sq ? 48 : tight ? 70 : 90, height: sq ? 710 : tight ? 772 : 820, justifyContent: 'center' }, (
            <>
              <div style={label(24, 0.32, ink(72), { marginBottom: sq ? 22 : tight ? 32 : 40 })}>{w.host}</div>
              <div style={name(sq ? Math.min(fs.st, 116) : fs.st, 1.02)}>{a}</div>
              <div style={text(sq ? 60 : 72, th.accent, { fontWeight: 200, lineHeight: 1.1, margin: '4px 0' })}>&amp;</div>
              <div style={name(sq ? Math.min(fs.st, 116) : fs.st, 1.02)}>{b}</div>
              <div style={text(34, ink(72), { marginTop: sq ? 18 : tight ? 28 : 36, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
              <div style={box({ width: 96, height: 2, backgroundColor: th.accent, margin: sq ? '22px 0 16px' : tight ? '32px 0 24px' : '40px 0 32px' })} />
              <div style={label(24, 0.3, ink(72))}>{dt.weekday}</div>
              <div style={text(sq ? 52 : 60, th.ink, { fontWeight: 500, letterSpacing: -1.2, marginTop: sq ? 6 : 10 })}>{dt.long}</div>
              {loneTime ? <div style={text(30, ink(72), { marginTop: 14 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't02':
      body = (
        <>
          {rule({ left: 36, top: 36, right: 36, bottom: 36, border: `2px solid ${th.accent}` })}
          {rule({ left: 50, top: 50, right: 50, bottom: 50, border: `1px solid ${accT(50)}` })}
          {centerCol({ left: 110, right: 110, top: sq ? 60 : tight ? 70 : 100, height: sq ? 698 : tight ? 772 : 820, justifyContent: 'center' }, (
            <>
              <div style={box({ position: 'relative', width: 112, height: 68, marginBottom: sq ? 18 : tight ? 26 : 40 })}>
                <div style={abs({ left: 0, top: 0, width: 68, height: 68, borderRadius: 34, border: `3px solid ${th.accent}` })} />
                <div style={abs({ left: 44, top: 0, width: 68, height: 68, borderRadius: 34, border: `3px solid ${th.accent}` })} />
              </div>
              <div style={label(24, 0.34, th.accBg, { marginBottom: sq ? 20 : tight ? 28 : 40 })}>{w.host}</div>
              <div style={name(sq ? Math.min(fs.st, 104) : fs.st, 1.02)}>{a}</div>
              <div style={text(sq ? 56 : 64, th.accent, { fontWeight: 200, lineHeight: 1.1, margin: sq ? '4px 0' : '8px 0' })}>&amp;</div>
              <div style={name(sq ? Math.min(fs.st, 104) : fs.st, 1.02)}>{b}</div>
              <div style={text(30, ink(76), { marginTop: sq ? 18 : tight ? 26 : 36, maxWidth: 760, justifyContent: 'center' })}>{w.invite}</div>
              <div style={box({ alignItems: 'center', gap: 34, marginTop: sq ? 22 : tight ? 30 : 44 })}>
                <div style={label(24, 0.28, th.ink, { width: 230, justifyContent: 'flex-end' })}>{dt.weekday}</div>
                <div style={box({ width: 2, height: 110, backgroundColor: th.accent })} />
                <div style={text(112, th.ink, { fontWeight: 200, lineHeight: 1, letterSpacing: -4.5 })}>{dt.day}</div>
                <div style={box({ width: 2, height: 110, backgroundColor: th.accent })} />
                <div style={label(24, 0.28, th.ink, { width: 230 })}>{`${dt.month} ${dt.year}`}</div>
              </div>
              {loneTime ? <div style={text(28, ink(76), { marginTop: 34 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't03':
      body = (
        <>
          {sq
            ? slot('cover', { left: 270, top: 40, width: 540, height: 504 }, { radius: [270, 270, 0, 0], ring: { offset: 16, width: 2, color: th.accent } })
            : slot('cover', { left: 240, top: tight ? 56 : 100, width: 600, height: 560 }, { radius: [300, 300, 0, 0], ring: { offset: 16, width: 2, color: th.accent } })}
          {centerCol({ left: 90, right: 90, top: sq ? 572 : tight ? 650 : 700 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(sq ? Math.min(fs.ol, 88) : fs.ol, 1.05, { marginTop: sq ? 10 : tight ? 14 : 20 })}
              <div style={label(24, 0.22, th.ink, { marginTop: sq ? 14 : tight ? 20 : 30 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't04':
      body = (
        <>
          {slot('cover', { left: 0, top: 0, width: 1080, height: 1350 }, { tint: accT(30), iconSize: 120, iconColor: th.accent })}
          {rule({
            left: 0,
            top: 0,
            width: 1080,
            height: 1350,
            // With venue lines the veil darkens sooner, so they read over the photo.
            backgroundImage: tight
              ? `linear-gradient(180deg, ${alpha(th.bg, 80)} 0%, ${alpha(th.bg, 38)} 30%, ${alpha(th.bg, 8)} 46%, ${alpha(th.bg, 66)} 61%, ${alpha(th.bg, 88)} 100%)`
              : `linear-gradient(180deg, ${alpha(th.bg, 80)} 0%, ${alpha(th.bg, 38)} 36%, ${alpha(th.bg, 8)} 56%, ${alpha(th.bg, 55)} 78%, ${alpha(th.bg, 85)} 100%)`,
          })}
          {centerCol({ left: 90, right: 90, top: 96 }, (
            <>
              <div style={label(24, 0.34, th.accent, { marginBottom: 34 })}>{w.host}</div>
              <div style={name(fs.st, 0.98)}>{a}</div>
              <div style={text(60, th.accent, { fontWeight: 300, lineHeight: 1.2, margin: '2px 0' })}>&amp;</div>
              <div style={name(fs.st, 0.98)}>{b}</div>
              <div style={label(26, 0.28, th.ink, { marginTop: 36 })}>{dt.dots}</div>
              {loneTime ? <div style={text(28, alpha(th.ink, 86), { marginTop: 12 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand({ label: th.accent, name: th.ink, addr: alpha(th.ink, 82), rule: alpha(th.ink, 30) })}
        </>
      );
      break;

    case 't05':
      body = (
        <>
          {slot('cover', { left: 540, top: 0, width: 540, height: 1350 })}
          {/* Ends at 930, clear of the stacked pass; spacing is tighter to fit. With a dress row it ends above the taller pass. */}
          <div style={col({ position: 'absolute', left: 80, top: hasDress ? 64 : 90, width: 400, height: hasDress ? 866 - lift : 840, alignItems: 'flex-start' })}>
            <div style={box({ alignItems: 'flex-end', fontSize: hasDress ? 96 : 130, lineHeight: 0.8, fontWeight: th.nw, letterSpacing: -5, color: th.accent })}>
              <span>{ini.a}</span>
              <span style={{ fontWeight: 200, fontSize: hasDress ? 72 : 98, margin: '0 6px', color: ink(40) }}>/</span>
              <span>{ini.b}</span>
            </div>
            <div style={label(22, 0.28, ink(72), { lineHeight: 1.6, margin: hasDress ? '18px 0 8px' : '28px 0 14px' })}>{w.host}</div>
            <div style={name(lift > 150 ? Math.min(fs.st, 84) : fs.st, 0.96)}>{a}</div>
            <div style={text(hasDress ? 40 : 48, th.accent, { fontWeight: 200, lineHeight: 1 })}>&amp;</div>
            <div style={name(lift > 150 ? Math.min(fs.st, 84) : fs.st, 0.96)}>{b}</div>
            <div style={text(hasDress ? 26 : 28, ink(72), { lineHeight: 1.3, marginTop: hasDress ? 12 : 18 })}>{w.invite}</div>
            <div style={col({ marginTop: 'auto', gap: hasDress ? 4 : 8, paddingTop: hasDress ? 14 : 24 })}>
              <div style={label(22, 0.28, th.accBg)}>{dt.weekday}</div>
              <div style={text(50, th.ink, { fontWeight: 500, letterSpacing: -1, lineHeight: 1.05 })}>{`${dt.day} ${dt.month}`}</div>
              <div style={text(28, ink(72))}>{dot(dt.year, hv ? '' : tm)}</div>
            </div>
          </div>
          {/* The venues get a panel of their own over the photo, beside the pass and the same height. */}
          {venueBand({ label: th.accPn, name: th.pink, addr: pink(70), rule: pink(18) })}
        </>
      );
      break;

    case 't06': {
      // With venue lines the monogram rises so the names clear the band; with
      // a dress row as well it also steps down to 400 (the gap and the rule
      // scale with it), so the A is not cut at the top.
      const up = sq ? 100 : tight ? 110 : 0;
      const mg = sq ? 400 : 460;
      const k6 = mg / 460;
      body = (
        <>
          <div style={abs({ left: sq ? 160 : 120, top: 40 - up, fontSize: mg, lineHeight: 1, fontWeight: th.nw, letterSpacing: -18 * k6 })}>{ini.a}</div>
          <div style={abs({ left: 560, top: 40 + 290 * k6 - up, fontSize: mg, lineHeight: 1, fontWeight: th.nw, letterSpacing: -18 * k6 })}>{ini.b}</div>
          {rule({ left: 538, top: 40 + 70 * k6 - up, width: 2, height: 700 * k6, backgroundColor: th.accent, transform: 'rotate(24deg)' })}
          {/* Sits at 780, not 836: room once kept for the kind pill, left so sent cards do not shift. */}
          {centerCol({ left: 90, right: 90, top: sq ? 610 : tight ? 690 : 780 }, (
            <>
              <div style={label(22, 0.34, th.accBg)}>{S.marrying}</div>
              <div style={{ ...text(fs.ol, th.ink, { fontWeight: 500, letterSpacing: -fs.ol * 0.02, marginTop: tight ? 14 : 18, whiteSpace: 'nowrap', gap: Math.round(fs.ol * 0.24) }) }}>
                <span>{a}</span>
                <span>&amp;</span>
                <span>{b}</span>
              </div>
              <div style={label(22, 0.22, ink(72), { marginTop: tight ? 14 : 18 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't07':
      body = (
        <>
          {centerCol({ left: 90, right: 90, top: sq ? 70 : 96, ...(tight ? {} : { height: 900 }) }, (
            <>
              <div style={label(24, 0.32, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: sq ? 18 : 26 })}
              <div style={text(30, ink(72), { marginTop: tight ? 12 : 16, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
              {/* A smaller numeral with venue lines (420, not 500), so the month clears them; 340 with a dress row as well. */}
              <div style={text(sq ? 340 : tight ? 420 : 500, th.accent, { fontWeight: 200, lineHeight: 0.82, letterSpacing: sq ? -20 : tight ? -25 : -30, marginTop: sq ? 24 : tight ? 32 : 44 })}>{dt.day}</div>
              {/* With venue lines (or a dress row) the weekday joins the month, in place of its own line. */}
              <div style={label(34, 0.4, th.ink, { marginTop: tight ? 10 : 14 })}>{tight ? `${dt.weekday} · ${dt.month} ${dt.year}` : `${dt.month} ${dt.year}`}</div>
              {tight ? (loneTime ? <div style={text(28, ink(72), { marginTop: 14 })}>{tm}</div> : null) : <div style={text(28, ink(72), { marginTop: 22 })}>{dot(dt.weekday, tm)}</div>}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't08': {
      const cal = calendar(d.date, lang);
      // Smaller days with venue lines (or a dress row), so the month still ends above them; smaller again with both.
      const cellH = sq ? (cal.rows > 5 ? 46 : 54) : tight ? (cal.rows > 5 ? 56 : 66) : cal.rows > 5 ? 64 : 76;
      const dot2 = sq ? (cal.rows > 5 ? 42 : 48) : tight ? (cal.rows > 5 ? 50 : 58) : cal.rows > 5 ? 56 : 66;
      // Whole pixels: 7 x 111.43 rounds past 780 and wraps the last weekday.
      const cw = Math.floor(780 / 7);
      body = (
        <>
          {centerCol({ left: 90, right: 90, top: sq ? 64 : 86, ...(tight ? {} : { height: 910 }) }, (
            <>
              <div style={label(22, 0.32, th.accBg)}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: sq ? 16 : 22 })}
              <div style={text(28, ink(76), { marginTop: sq ? 10 : 14 })}>{w.invite}</div>
              <div style={col({ width: 780, marginTop: sq ? 20 : tight ? 28 : 40, paddingTop: sq ? 16 : tight ? 22 : 30, borderTop: `1px solid ${ink(22)}` })}>
                <div style={box({ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: sq ? 10 : tight ? 14 : 20, padding: '0 22px' })}>
                  <div style={label(28, 0.3, th.ink)}>{dt.month}</div>
                  <div style={label(28, 0.3, th.accBg, { textTransform: 'none' })}>{dt.year}</div>
                </div>
                <div style={box({ flexWrap: 'wrap', width: 780 })}>
                  {cal.head.map((h, i) => (
                    <div key={`h${i}`} style={label(20, 0.1, ink(62), { width: cw, justifyContent: 'center', paddingBottom: sq ? 8 : 12 })}>
                      {h}
                    </div>
                  ))}
                  {cal.cells.map((c, i) => (
                    <div key={`c${i}`} style={box({ width: cw, height: cellH, alignItems: 'center', justifyContent: 'center' })}>
                      <div
                        style={box({
                          width: dot2,
                          height: dot2,
                          borderRadius: dot2 / 2,
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: sq ? 26 : tight ? 28 : 30,
                          backgroundColor: c.on ? th.accent : 'transparent',
                          color: c.on ? th.onacc : th.ink,
                          fontWeight: c.on ? 700 : 400,
                        })}
                      >
                        {c.n}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={text(28, ink(76), { marginTop: sq ? 8 : tight ? 14 : 22 })}>{dot(dt.weekday, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't09':
      body = (
        <>
          {sq
            ? slot('cover', { left: 300, top: 36, width: 480, height: 480 }, { radius: [240, 240, 240, 240], ring: { offset: 18, width: 2, color: th.accent } })
            : slot('cover', { left: 270, top: tight ? 36 : 96, width: 540, height: 540 }, { radius: [270, 270, 270, 270], ring: { offset: 18, width: 2, color: th.accent } })}
          {centerCol({ left: 90, right: 90, top: sq ? 552 : tight ? 618 : 688 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: sq ? 14 : 22 })}
              <div style={text(32, th.ink, { fontWeight: 500, marginTop: sq ? 18 : 28 })}>{`${dt.weekday}, ${dt.long}`}</div>
              {loneTime ? <div style={text(28, ink(72), { marginTop: 10 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't10':
      // With venue lines the two photos rise (and close up a little) to make
      // room; with a dress row as well they are drawn at 86%.
      body = (
        <>
          {sq
            ? slot('cover', { left: 190, top: 24, width: 310, height: 482 }, { radius: [155, 155, 155, 155], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 72 })
            : slot('cover', { left: 150, top: tight ? 20 : 90, width: 360, height: 560 }, { radius: [180, 180, 180, 180], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 80 })}
          {sq
            ? slot('second', { left: 580, top: 56, width: 310, height: 482 }, { radius: [155, 155, 155, 155], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 72 })
            : slot('second', { left: 570, top: tight ? 56 : 150, width: 360, height: 560 }, { radius: [180, 180, 180, 180], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 80 })}
          {centerCol({ left: 90, right: 90, top: sq ? 566 : tight ? 636 : 730 }, (
            <>
              {oneLine(fs.ol, 1.05)}
              <div style={text(28, ink(72), { marginTop: sq ? 8 : tight ? 12 : 18, maxWidth: 860, justifyContent: 'center' })}>{w.invite}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: sq ? 12 : tight ? 16 : 26 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't11': {
      const rat = (d.ratiba || []).slice(0, 6);
      // The programme gives up its foot to the venue lines, and more with a dress row as well.
      const ratBox = sq ? 440 : tight ? 530 : 600;
      const ratH = Math.min(118, Math.floor(ratBox / Math.max(1, rat.length)));
      body = (
        <>
          {centerCol({ left: 90, right: 90, top: 90 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 22 })}
              <div style={label(24, 0.24, th.accBg, { marginTop: 24 })}>{`${dt.weekday} · ${dt.long}`}</div>
            </>
          ))}
          <div style={col({ position: 'absolute', left: 150, right: 100, top: sq ? 286 : tight ? 300 : 340, height: ratBox, justifyContent: 'center' })}>
            {rule({ left: 189, top: 70, bottom: 70, width: 2, backgroundColor: ink(16) })}
            {rat.map((r, i) => (
              <div key={i} style={box({ position: 'relative', alignItems: 'center', height: ratH })}>
                <div style={label(30, 0.06, th.accBg, { width: 160, flexShrink: 0, justifyContent: 'flex-end', textTransform: 'none' })}>{r.t}</div>
                <div style={box({ width: 60, flexShrink: 0, justifyContent: 'center' })}>
                  <div style={box({ width: 30, height: 30, borderRadius: 15, backgroundColor: th.bg, alignItems: 'center', justifyContent: 'center' })}>
                    <div style={box({ width: 14, height: 14, borderRadius: 7, backgroundColor: th.accent })} />
                  </div>
                </div>
                <div style={box({ width: 72, flexShrink: 0, justifyContent: 'center' })}>
                  <Icon name={r.icon} size={44} color={th.accBg} />
                </div>
                <div style={col({ gap: 4, marginLeft: 18 })}>
                  <div style={text(34, th.ink, { fontWeight: 500, letterSpacing: -0.3 })}>{r[lang] || r.sw || r.en}</div>
                  {r.place ? <div style={text(24, ink(68))}>{r.place}</div> : null}
                </div>
              </div>
            ))}
          </div>
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't12':
      body = (
        <>
          <div style={col({ position: 'absolute', left: 90, right: 90, top: sq ? 70 : 90, alignItems: 'flex-start' })}>
            <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
            <div style={name(sq ? Math.min(fs.st, 104) : fs.st, 1.02, { marginTop: sq ? 16 : 22 })}>{a}</div>
            <div style={{ ...name(sq ? Math.min(fs.st, 104) : fs.st, 1.02), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={label(22, 0.24, ink(72), { marginTop: 24 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
          </div>
          {sq ? slot('cover', { left: 60, top: 468, width: 960, height: 320 }, { iconSize: 80 }) : slot('cover', { left: 0, top: 500, width: 1080, height: 360 }, { iconSize: 88 })}
          {/* The ceremony and the reception side by side under the photo, as this template always had them. */}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't13':
      body = (
        <>
          <div style={abs({ left: 440, top: sq ? 50 : 80, width: 200, height: 200, borderRadius: 100, backgroundColor: th.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 14px 34px ${alpha(th.accent, 34)}` })}>
            <div style={abs({ left: 12, top: 12, width: 176, height: 176, borderRadius: 88, border: `2px solid ${alpha(th.onacc, 55)}` })} />
            <div style={box({ alignItems: 'center', whiteSpace: 'nowrap', fontSize: 62, fontWeight: 300, color: th.onacc, letterSpacing: 1.2 })}>
              <span>{ini.a}</span>
              <span style={{ fontWeight: 200, margin: '0 6px' }}>·</span>
              <span>{ini.b}</span>
            </div>
          </div>
          {centerCol({ left: 90, right: 90, top: sq ? 262 : tight ? 296 : 300, height: sq ? 496 : tight ? 546 : 640 }, (
            <>
              <div style={label(22, 0.32, ink(72))}>{w.host}</div>
              <div style={name(sq ? Math.min(fs.st, 88) : fs.st, 1.02, { marginTop: sq ? 20 : 30 })}>{a}</div>
              <div style={text(sq ? 48 : 56, th.accent, { fontWeight: 200, lineHeight: 1.15, margin: '4px 0' })}>&amp;</div>
              <div style={name(sq ? Math.min(fs.st, 88) : fs.st, 1.02)}>{b}</div>
              <div style={text(28, ink(74), { marginTop: sq ? 16 : tight ? 22 : 28, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
              <div style={box({ alignItems: 'center', gap: 30, marginTop: sq ? 20 : tight ? 28 : 36 })}>
                <div style={label(24, 0.28, th.ink, { width: 220, justifyContent: 'flex-end' })}>{dt.weekday}</div>
                <div style={box({ width: 2, height: 100, backgroundColor: th.accent })} />
                <div style={col({ alignItems: 'center' })}>
                  <div style={text(96, th.ink, { fontWeight: 200, lineHeight: 0.9, letterSpacing: -3.8 })}>{dt.day}</div>
                  <div style={label(22, 0.2, th.ink, { marginTop: 8 })}>{dt.year}</div>
                </div>
                <div style={box({ width: 2, height: 100, backgroundColor: th.accent })} />
                <div style={label(24, 0.28, th.ink, { width: 220 })}>{dt.month}</div>
              </div>
              {loneTime ? <div style={text(28, ink(74), { marginTop: 26 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't14': {
      const cell = (k: string, v: string, i: number) => (
        <div key={i} style={col({ width: 430, padding: '24px 0', borderBottom: `1px solid ${ink(20)}`, gap: 8 })}>
          <div style={label(20, 0.26, th.accBg)}>{k}</div>
          <div style={text(32, th.ink, { fontWeight: 500 })}>{v}</div>
        </div>
      );
      body = (
        <>
          <div style={box({ position: 'absolute', left: 90, right: 90, top: 86, justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 22, borderBottom: `3px solid ${th.ink}` })}>
            <div style={label(22, 0.28, th.ink)}>{S.invitation}</div>
            <div style={label(22, 0.2, th.accBg)}>{`No. ${d.code}`}</div>
          </div>
          <div style={col({ position: 'absolute', left: 90, right: 90, top: 182 })}>
            <div style={name(sq ? Math.min(fs.st, 116) : fs.st, 0.96)}>{a}</div>
            <div style={{ ...name(sq ? Math.min(fs.st, 116) : fs.st, 0.96), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={text(32, ink(72), { lineHeight: 1.4, marginTop: sq ? 28 : 40, maxWidth: 780 })}>{`${w.host}, ${w.invite}.`}</div>
          </div>
          {/* The date, then the church and the hall in the same two columns. */}
          <div style={box({ position: 'absolute', left: 90, right: 90, top: 670 - (sq ? lift : 0), flexWrap: 'wrap', columnGap: 40, borderTop: `1px solid ${ink(20)}` })}>
            {cell(dt.weekday, dt.long, 0)}
            {loneTime ? cell(w.ceremony, tm, 1) : null}
          </div>
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't15': {
      /** The ticket keeps its big times; each venue's name and address go under its time. */
      // The two stubs share 820 with the arrow (56) and two gaps of 30.
      const colW = vrows.length > 1 ? (vb.width - 116) / 2 : vb.width;
      const stub = (r: VenueRow, right: boolean) => {
        const ta = right ? 'right' : 'left';
        return (
          <div key={r.key} data-venue={r.key} style={col({ flex: 1, minWidth: 0, gap: 6, alignItems: right ? 'flex-end' : 'flex-start' })}>
            <div style={label(20, 0.24, th.accPn, { lineHeight: 1.2, whiteSpace: 'nowrap' })}>{r.label}</div>
            {r.time ? <div style={text(84, th.ink, { fontWeight: 300, letterSpacing: -2.5, lineHeight: 1 })}>{r.time}</div> : null}
            <div style={twoLines(r.name, 24, colW, th.ink, ta)}>{r.name}</div>
            {r.addr ? <div style={oneLineCut(r.addr, 22, colW, inkP(68), ta)}>{r.addr}</div> : null}
          </div>
        );
      };
      const stubs: ReactNode[] = [];
      vrows.forEach((r, i) => {
        if (i > 0) {
          stubs.push(
            <div key="arrow" style={box({ paddingTop: 50, flexShrink: 0 })}>
              <svg width={56} height={30} viewBox="0 0 56 30" style={{ display: 'flex' }}>
                <path d="M2 15h50M40 3l12 12-12 12" fill="none" stroke={th.accPn} strokeWidth={2} />
              </svg>
            </div>,
          );
        }
        stubs.push(stub(r, i > 0));
      });
      body = (
        <>
          {rule({ left: 70, top: 70, width: 940, height: 1210, borderRadius: 28, backgroundColor: th.panel })}
          {rule({ left: 36, top: 956 - lift, width: 68, height: 68, borderRadius: 34, backgroundColor: th.bg })}
          {rule({ left: 976, top: 956 - lift, width: 68, height: 68, borderRadius: 34, backgroundColor: th.bg })}
          {rule({ left: 130, right: 130, top: 988 - lift, height: 0, borderTop: `3px dashed ${inkP(26)}` })}
          <div style={col({ position: 'absolute', left: 130, right: 130, top: 126, color: th.ink })}>
            <div style={box({ justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: `1px solid ${inkP(18)}` })}>
              <div style={label(22, 0.28, th.accPn)}>{S.invitation}</div>
              <div style={label(22, 0.2, inkP(68), { textTransform: 'none' })}>{dt.short}</div>
            </div>
            <div style={label(22, 0.28, inkP(68), { marginTop: 48 })}>{w.host}</div>
            <div style={name(fs.st, 1, { marginTop: 22 })}>{a}</div>
            <div style={{ ...name(fs.st, 1), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 300, color: th.accPn }}>&amp;</span>
              <span>{b}</span>
            </div>
          </div>
          {hv ? (
            <div
              data-venues={vrows.length}
              style={box({ position: 'absolute', left: vb.left, top: vb.top, width: vb.width, height: vb.height, overflow: 'hidden', alignItems: 'flex-start', gap: 30, paddingTop: 30, borderTop: `1px solid ${inkP(18)}` })}
            >
              {stubs}
            </div>
          ) : null}
          <div style={label(22, 0.26, inkP(68), { position: 'absolute', left: 130, right: 130, top: 914 - lift, justifyContent: 'center' })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
        </>
      );
      break;
    }

    case 't16': {
      const p = placed('cover');
      body = (
        <>
          {/* With venue lines (or a dress row) the print rises and shrinks a little so the date clears them; with both, more. */}
          <div style={abs({ left: 190, top: sq ? 0 : tight ? 30 : 70, width: 700, height: 780, backgroundColor: th.panel, transform: sq ? 'rotate(-2.5deg) scale(0.8)' : tight ? 'rotate(-2.5deg) scale(0.9)' : 'rotate(-2.5deg)', boxShadow: '0 30px 70px rgba(26,37,22,0.45)' })}>
            <div style={abs({ left: 32, top: 32, width: 636, height: 600, overflow: 'hidden', backgroundColor: mix(th.accent, 30, th.panel), alignItems: 'center', justifyContent: 'center' })}>
              {p !== null ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.src} alt="" width={Math.round(p.width)} height={Math.round(p.height)} style={imgStyle(p)} />
              ) : placeholders ? (
                <Icon name="AddPhotoAlternate" size={96} color={th.accPn} />
              ) : null}
            </div>
            <div style={abs({ left: 32, right: 32, top: 648, height: 110, alignItems: 'center', justifyContent: 'center', color: th.pink })}>
              <div style={{ ...name(fs.ol, 1.1), whiteSpace: 'nowrap', gap: Math.round(fs.ol * 0.24) }}>
                <span>{a}</span>
                <span>&amp;</span>
                <span>{b}</span>
              </div>
            </div>
          </div>
          {centerCol({ left: 90, right: 90, top: sq ? 716 : tight ? 806 : 892 }, (
            <>
              <div style={label(24, 0.26, th.accBg)}>{`${dt.weekday} · ${dt.long}`}</div>
              {loneTime ? <div style={text(28, ink(78), { marginTop: 14 })}>{tm}</div> : null}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't17':
      body = (
        <>
          {centerCol({ left: 110, right: 110, top: sq ? 40 : tight ? 60 : 80, height: sq ? 718 : tight ? 800 : 910 }, (
            <>
              <div style={text(sq ? 140 : 180, th.accent, { lineHeight: 0.8, fontWeight: 200, height: sq ? 84 : 112 })}>“</div>
              <div style={text(fs.verse, th.ink, { fontWeight: 300, lineHeight: 1.32, letterSpacing: -fs.verse * 0.01, marginTop: 8, justifyContent: 'center' })}>{w.verse}</div>
              {w.verseRef ? <div style={label(22, 0.26, th.accBg, { marginTop: 28 })}>{w.verseRef}</div> : null}
              <div style={box({ width: 80, height: 2, backgroundColor: ink(22), margin: sq ? '24px 0' : tight ? '36px 0' : '48px 0' })} />
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 20 })}
              <div style={text(28, ink(72), { marginTop: 16, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: tight ? 20 : 26 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't18':
      body = (
        <>
          {slot('cover', { left: 0, top: 0, width: 1080, height: 760 }, { tint: accT(26), iconSize: 110, iconColor: th.accent })}
          {/* With venue lines and a dress row the names sit higher, so the photo fades to the ground sooner. */}
          {rule({ left: 0, top: 0, width: 1080, height: 770, backgroundImage: sq ? `linear-gradient(180deg, ${alpha(th.bg, 30)} 0%, ${alpha(th.bg, 0)} 18%, ${alpha(th.bg, 0)} 34%, ${th.bg} 80%)` : `linear-gradient(180deg, ${alpha(th.bg, 30)} 0%, ${alpha(th.bg, 0)} 22%, ${alpha(th.bg, 0)} 42%, ${th.bg} 94%)` })}
          {centerCol({ left: 90, right: 90, top: sq ? 548 : tight ? 604 : 660 }, (
            <>
              <div style={label(22, 0.32, th.accBg)}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 24 })}
              <div style={box({ alignItems: 'center', gap: 28, marginTop: 32 })}>
                <div style={box({ width: hv ? 90 : 120, height: 1, backgroundColor: alpha(th.accent, 60) })} />
                {/* With venue lines the weekday joins the date here, in place of the line below. */}
                <div style={label(26, 0.3, th.ink, { textTransform: hv ? 'uppercase' : 'none' })}>{hv ? `${dt.weekday} · ${dt.dots}` : dt.dots}</div>
                <div style={box({ width: hv ? 90 : 120, height: 1, backgroundColor: alpha(th.accent, 60) })} />
              </div>
              {hv ? null : <div style={text(28, ink(78), { marginTop: 18 })}>{dot(dt.weekday, tm)}</div>}
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;

    case 't19': {
      const dots: ReactNode[] = [];
      // The kanga border: accent dots on ink, every 22px, drawn as one SVG.
      for (let y = 11; y < 1290; y += 22) {
        for (let x = 11; x < 1020; x += 22) {
          if (x > 50 && x < 970 && y > 50 && y < 1240) continue;
          dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={th.accent} />);
        }
      }
      // A smaller monogram with venue lines (or a dress row), so the kanga line still ends above them; smaller again with both.
      const ring = sq ? 160 : tight ? 200 : 250;
      const disc = sq ? 120 : tight ? 150 : 188;
      body = (
        <>
          <div style={abs({ left: 30, top: 30, width: 1020, height: 1290, backgroundColor: th.ink })}>
            <svg width={1020} height={1290} viewBox="0 0 1020 1290" style={{ display: 'flex', position: 'absolute', left: 0, top: 0 }}>
              {dots}
            </svg>
          </div>
          {rule({ left: 68, top: 68, right: 68, bottom: 68, backgroundColor: th.accent })}
          {rule({ left: 70, top: 70, right: 70, bottom: 70, backgroundColor: th.bg })}
          {/* Ends at 938: the kanga band is full width and must stay clear of the pass. */}
          {centerCol({ left: 112, right: 112, top: sq ? 90 : tight ? 96 : 108, height: sq ? 668 : tight ? 746 : 830 }, (
            <>
              <div style={label(22, 0.32, ink(72))}>{w.host}</div>
              <div style={box({ position: 'relative', width: ring, height: ring, marginTop: tight ? 20 : 28, alignItems: 'center', justifyContent: 'center' })}>
                <DottedRing size={ring} width={9} color={th.accent} />
                <div style={box({ width: disc, height: disc, borderRadius: disc / 2, backgroundColor: th.ink, color: th.bg, alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontSize: sq ? 46 : tight ? 56 : 70, fontWeight: 800, letterSpacing: -1.4 })}>
                  {`${ini.a}${ini.b}`}
                </div>
              </div>
              <div style={name(sq ? Math.min(fs.st, 92) : fs.st, 1, { marginTop: sq ? 20 : tight ? 26 : 32 })}>{a}</div>
              <div style={text(44, th.accent, { fontWeight: 300, lineHeight: 1.2 })}>&amp;</div>
              <div style={name(sq ? Math.min(fs.st, 92) : fs.st, 1)}>{b}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: sq ? 16 : tight ? 22 : 28 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
              <div style={box({ marginTop: 'auto', width: '100%', padding: tight ? '14px 0' : '18px 0', borderTop: `2px solid ${th.ink}`, borderBottom: `2px solid ${th.ink}`, fontSize: tight ? 28 : 30, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.25, justifyContent: 'center', textAlign: 'center' })}>
                {w.kanga}
              </div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't20': {
      // With venue lines (or a dress row) the window rises 64 so the names
      // clear them; with both it is drawn at 82% from the top.
      const k20 = sq ? 0.82 : 1;
      const top20 = sq ? 30 : 66 - (tight ? 64 : 0);
      const x20 = (x: number) => 540 + (x - 540) * k20;
      const y20 = (y: number) => top20 + (y - 66) * k20;
      body = (
        <>
          {rule({ left: x20(156), top: y20(66), width: 768 * k20, height: 648 * k20, backgroundColor: th.panel, boxShadow: '0 24px 60px rgba(26,37,22,0.18)' })}
          {slot('cover', { left: x20(180), top: y20(90), width: 720 * k20, height: 600 * k20 })}
          {rule({ left: x20(532), top: y20(90), width: 16 * k20, height: 600 * k20, backgroundColor: th.panel })}
          {rule({ left: x20(180), top: y20(382), width: 720 * k20, height: 16 * k20, backgroundColor: th.panel })}
          {rule({ left: x20(126), top: y20(714), width: 828 * k20, height: 26 * k20, borderRadius: 4, backgroundColor: inkP(16) })}
          {centerCol({ left: 90, right: 90, top: y20(714) + 38 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: tight ? 6 : 10 })}
              <div style={label(24, 0.22, th.ink, { marginTop: tight ? 10 : 14 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't21': {
      const songTitle = d.music?.title || S.ourSong;
      const songArtist = d.music?.artist || '';
      // With venue lines (or a dress row) the record is smaller (520, not 600) and higher, centred on 284; with both, 460 on 250.
      const rec = sq ? 460 : tight ? 520 : 600;
      const cy = sq ? 250 : tight ? 284 : 370;
      body = (
        <>
          <div style={abs({ left: 540 - rec / 2, top: cy - rec / 2, width: rec, height: rec, borderRadius: rec / 2, boxShadow: `0 30px 70px rgba(0,0,0,0.35)` })}>
            <Vinyl size={rec} groove={3} />
          </div>
          {rule({ left: 404, top: cy - 136, width: 272, height: 272, borderRadius: 136, backgroundColor: th.accent })}
          {slot('cover', { left: 410, top: cy - 130, width: 260, height: 260 }, { radius: [130, 130, 130, 130], tint: th.accent })}
          {rule({ left: 531, top: cy - 9, width: 18, height: 18, borderRadius: 9, backgroundColor: th.bg })}
          {centerCol({ left: 90, right: 90, top: sq ? 508 : tight ? 562 : 690 }, (
            <>
              <div style={label(22, 0.3, th.accBg)}>{songArtist ? `${S.ourSong} · ${songArtist}` : S.ourSong}</div>
              <div style={text(52, th.ink, { fontWeight: 300, letterSpacing: -1, marginTop: 10, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 900 })}>{`“${songTitle}”`}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 16 })}
              <div style={label(24, 0.22, ink(76), { marginTop: 14 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }

    case 't22': {
      const stops = (d.story || []).slice(0, 3).map((s) => ({ y: s.y, text: s[lang] || s.sw || s.en || '', last: false }));
      stops.push({ y: dt.short, text: d.ceremony.name || d.reception.name, last: true });
      body = (
        <>
          <div style={col({ position: 'absolute', left: 90, top: sq ? 72 : 96, width: 560, alignItems: 'flex-start' })}>
            <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
            <div style={name(sq ? Math.min(fs.st, 84) : fs.st, 1.02, { marginTop: sq ? 18 : 26 })}>{a}</div>
            <div style={{ ...name(sq ? Math.min(fs.st, 84) : fs.st, 1.02), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={text(30, ink(72), { lineHeight: 1.4, marginTop: sq ? 18 : 30, maxWidth: 520 })}>{w.invite}</div>
            <div style={label(22, 0.28, th.accBg, { marginTop: sq ? 22 : 44 })}>{dt.weekday}</div>
            <div style={text(sq ? 48 : 56, th.ink, { fontWeight: 500, letterSpacing: -1.1, marginTop: sq ? 4 : 8 })}>{dt.long}</div>
            {loneTime ? <div style={text(28, ink(72), { marginTop: 10 })}>{tm}</div> : null}
          </div>
          {/* The church and the hall one under the other, in the left column under the date. */}
          {venueBand(venueInk)}
          {/* The route ends above the line pass, which rises with a dress row. */}
          <div style={abs({ left: 700, top: 100, width: 300, height: 880 - lift })}>
            {rule({ left: 15, top: 70, bottom: 30, width: 3, backgroundColor: ink(18) })}
            <div style={label(20, 0.26, ink(66), { position: 'absolute', left: 4, top: 0 })}>{S.route}</div>
            <div style={col({ position: 'absolute', left: 0, top: 70, right: 0, bottom: 0, justifyContent: 'space-between' })}>
              {stops.map((st, i) => {
                const ds = st.last ? 34 : 24;
                return (
                  <div key={i} style={col({ position: 'relative', paddingLeft: 52 })}>
                    <div style={abs({ left: st.last ? -1 : 4, top: st.last ? 2 : 6, width: ds, height: ds, borderRadius: ds / 2, backgroundColor: st.last ? th.accent : th.bg, border: `3px solid ${th.accent}`, boxShadow: `0 0 0 6px ${th.bg}` })} />
                    <div style={label(22, 0.12, th.accBg, { textTransform: 'none' })}>{st.y}</div>
                    <div style={text(26, th.ink, { lineHeight: 1.3, marginTop: 6, fontWeight: st.last ? 600 : 400 })}>{st.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
      break;
    }

    case 't23': {
      // With venue lines (or a dress row) the album rises 72 and the names
      // step down a size, so they clear them; with both it is drawn at 86%.
      const up = tight ? 72 : 0;
      const ol = tight ? Math.min(fs.ol, 76) : fs.ol;
      const k23 = sq ? 0.86 : 1;
      const x23 = (x: number) => 540 + (x - 540) * k23;
      const y23 = (y: number) => (sq ? 30 : 90 - up) + (y - 90) * k23;
      body = (
        <>
          {slot('cover', { left: x23(90), top: y23(90), width: 548 * k23, height: 600 * k23 }, { iconSize: 88 })}
          {slot('second', { left: x23(654), top: y23(90), width: 336 * k23, height: 292 * k23 }, { iconSize: 64 })}
          {slot('third', { left: x23(654), top: y23(398), width: 336 * k23, height: 292 * k23 }, { iconSize: 64 })}
          {centerCol({ left: 90, right: 90, top: sq ? 562 : tight ? 628 : 700 }, (
            <>
              <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
              {oneLine(ol, 1.05, { marginTop: sq ? 6 : tight ? 10 : 16 })}
              <div style={text(28, ink(72), { marginTop: sq ? 6 : tight ? 8 : 12 })}>{w.invite}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: sq ? 8 : tight ? 12 : 20 })}>{dot(dt.weekday, dt.long, hv ? '' : tm)}</div>
            </>
          ))}
          {venueBand(venueInk)}
        </>
      );
      break;
    }


    default:
      body = null;
  }

  // ===== Gate passes =====
  /**
   * SINGLE or DOUBLE, as on the printed card: a dark pill with white mono
   * text in the banner's bottom-right corner, where the product owner drew
   * it. The same grey on every template so the gate reads it the same way
   * whatever the palette; mono on purpose even when the couple chose sans
   * labels. It flows with the text rather than sitting absolutely, so a
   * long guest name or a long gate line pushes it instead of running under it.
   */
  const kindPill = (extra: CSSProperties = {}) => (
    <div
      style={box({
        flexShrink: 0,
        height: KIND_PILL_H,
        padding: '0 20px',
        alignItems: 'center',
        borderRadius: KIND_PILL_H / 2,
        backgroundColor: 'rgba(48,48,48,0.86)',
        fontFamily: fonts.mono,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 3.6,
        textTransform: 'uppercase',
        color: '#FFFFFF',
        whiteSpace: 'nowrap',
        ...extra,
      })}
    >
      {cardKindLabel(g.kind)}
    </div>
  );

  /**
   * The dress-code row: the label, then one round swatch per colour with its
   * name under it (names cut with an ellipsis when the row is crowded), or
   * bare swatches when the design has only hexes. A thin edge in the banner's
   * ink keeps a white or cream swatch visible on a white banner.
   */
  const DRESS_LABEL_W = 110;
  const dressCells = (c: { name: string; edge: string }, width: number, perRow: number) => {
    const named = chips.some((x) => x.name !== '');
    const size = named ? 40 : 46;
    const cell = Math.min(named ? 150 : 84, Math.floor(width / Math.max(1, Math.min(perRow, chips.length))));
    return chips.map((x, i) => (
      <div key={`chip${i}`} data-chip={x.hex} style={col({ width: cell, flexShrink: 0, alignItems: 'center', gap: 6, padding: '0 3px' })}>
        <div style={box({ width: size, height: size, flexShrink: 0, borderRadius: size / 2, backgroundColor: x.hex, border: `2px solid ${c.edge}` })} />
        {named ? <div style={oneLineCut(x.name, chips.length > 6 ? 19 : 20, cell - 6, c.name, 'center', { lineHeight: 1.25, fontWeight: 500 })}>{x.name}</div> : null}
      </div>
    ));
  };
  /** One full-width row under the QR and the text (card, glass, line and ticket passes). "DRESS CODE" takes two lines. */
  const dressRow = (c: { label: string; name: string; edge: string; rule: string }, width: number, height: number) => (
    <div data-dress={chips.length} style={box({ width, height, flexShrink: 0, alignItems: 'center', gap: 16, borderTop: `1px solid ${c.rule}` })}>
      <div style={label(17, 0.22, c.label, { width: DRESS_LABEL_W, flexShrink: 0, lineHeight: 1.3 })}>{S.dressCode}</div>
      <div style={box({ flex: 1, minWidth: 0, alignItems: 'flex-start' })}>{dressCells(c, width - DRESS_LABEL_W - 16, chips.length)}</div>
    </div>
  );

  const passText = (c: { label: string; strong: string; muted: string; faint: string }, size = fs.guest) => (
    <div style={col({ gap: fs.passGap, flex: 1, minWidth: 0 })}>
      <div style={label(22, 0.26, c.label)}>{S.invFor}</div>
      <div style={text(size, c.strong, { fontWeight: 500, lineHeight: 1.12, letterSpacing: -size * 0.01 })}>{g.name}</div>
      <div style={text(26, c.muted)}>{`${S.card} ${no} · ${seats}`}</div>
      {/* The gate line and the pill share a row, so the pill lands on its baseline at the right edge. */}
      <div style={box({ alignItems: 'center', gap: 24 })}>
        <div style={text(22, c.faint, { flex: 1, minWidth: 0 })}>{S.gate}</div>
        {kindPill()}
      </div>
    </div>
  );

  let pass: ReactNode = null;
  if (!cover) {
    if (t.pass === 'card') {
      const b = DRESS_BANDS.card;
      pass = hasDress ? (
        // The same banner, taller: the QR and the text in a row with less padding, the dress row under them.
        <div style={col({ position: 'absolute', left: 90, right: 90, top: CARD_H - 80 - b.height - lift, height: b.height + lift, padding: '0 40px', borderRadius: 24, backgroundColor: th.panel, color: th.pink, border: `2px solid ${pink(10)}` })}>
          <div style={box({ flex: 1, minHeight: 0, alignItems: 'center', gap: 40 })}>
            {qrBox(196, 12)}
            {passText({ label: pink(68), strong: th.pink, muted: pink(70), faint: pink(62) })}
          </div>
          {dressRow({ label: pink(68), name: pink(72), edge: pink(26), rule: pink(14) }, 900 - 4 - 80, b.strip)}
        </div>
      ) : (
        <div style={abs({ left: 90, right: 90, top: CARD_H - 80 - 260, height: 260, alignItems: 'center', gap: 40, padding: '0 40px', borderRadius: 24, backgroundColor: th.panel, color: th.pink, border: `2px solid ${pink(10)}` })}>
          {qrBox(196, 12)}
          {passText({ label: pink(68), strong: th.pink, muted: pink(70), faint: pink(62) })}
        </div>
      );
    } else if (t.pass === 'line') {
      const b = DRESS_BANDS.line;
      pass = (
        <>
          {rule({ left: 90, right: 90, top: 1036 - lift, height: 2, backgroundColor: ink(16) })}
          <div style={abs({ left: 90, right: 90, top: CARD_H - 64 - 230 - lift, height: 230, alignItems: 'center', gap: 44 })}>
            {qrBox(210, 14, `0 0 0 2px ${ink(12)}`)}
            {passText({ label: ink(70), strong: th.ink, muted: ink(72), faint: ink(66) })}
          </div>
          {hasDress ? (
            <div style={abs({ left: 90, right: 90, top: CARD_H - 64 - 230 - lift + b.row, height: b.strip })}>
              {dressRow({ label: ink(70), name: ink(72), edge: ink(26), rule: ink(14) }, 900, b.strip)}
            </div>
          ) : null}
        </>
      );
    } else if (t.pass === 'glass') {
      const b = DRESS_BANDS.glass;
      const glassText = passText({ label: th.accent, strong: th.ink, muted: alpha(th.ink, 84), faint: alpha(th.ink, 78) });
      const glassBox: CSSProperties = {
        left: 90,
        right: 90,
        top: CARD_H - 80 - b.height - lift,
        height: b.height + lift,
        padding: '0 40px 0 32px',
        borderRadius: 24,
        backgroundColor: alpha(th.bg, web ? 66 : 80),
        border: `2px solid ${alpha(th.ink, 22)}`,
        color: th.ink,
        ...(web ? { backdropFilter: 'blur(16px)' } : {}),
      };
      pass = hasDress ? (
        <div style={col({ position: 'absolute', ...glassBox })}>
          <div style={box({ flex: 1, minHeight: 0, alignItems: 'center', gap: 40 })}>
            {qrBox(196, 12)}
            {glassText}
          </div>
          {dressRow({ label: th.accent, name: alpha(th.ink, 84), edge: alpha(th.ink, 40), rule: alpha(th.ink, 22) }, 900 - 4 - 72, b.strip)}
        </div>
      ) : (
        <div
          style={abs({
            left: 90,
            right: 90,
            top: CARD_H - 80 - 260,
            height: 260,
            alignItems: 'center',
            gap: 40,
            // 40 on the right, not 32, so the pill keeps the same margin from the edge as on the card pass.
            padding: '0 40px 0 32px',
            borderRadius: 24,
            backgroundColor: alpha(th.bg, web ? 66 : 80),
            border: `2px solid ${alpha(th.ink, 22)}`,
            color: th.ink,
            ...(web ? { backdropFilter: 'blur(16px)' } : {}),
          })}
        >
          {qrBox(196, 12)}
          {glassText}
        </div>
      );
    } else if (t.pass === 'stack') {
      // The name runs the full width below the QR row, so the pill goes at the
      // bottom-right of the QR row (level with the QR's foot) where it can
      // never meet the name however many lines that takes. The panel is
      // pinned by its foot and grows upward for a long name, into the strip
      // the t05 body leaves clear above it (it ends at 930).
      pass = (
        <div style={col({ position: 'absolute', left: 60, width: 440, bottom: 60, minHeight: 290 + lift, justifyContent: 'center', gap: 18, padding: 28, borderRadius: 24, backgroundColor: th.panel, color: th.pink })}>
          <div style={box({ alignItems: 'center', gap: 22 })}>
            {qrBox(150, 10)}
            <div style={col({ flex: 1, gap: 6, alignSelf: 'stretch' })}>
              <div style={label(18, 0.22, pink(68))}>{S.invFor}</div>
              <div style={text(24, pink(72))}>{`${S.card} ${no}`}</div>
              <div style={text(24, pink(72))}>{seats}</div>
              {kindPill({ marginTop: 'auto', alignSelf: 'flex-end' })}
            </div>
          </div>
          <div style={text(fs.guestS, th.pink, { fontWeight: 500, lineHeight: 1.15 })}>{g.name}</div>
          {hasDress ? (
            // Too narrow for one row: the label on its own line, four swatches to a row.
            <div data-dress={chips.length} style={col({ height: lift - 18, flexShrink: 0, gap: 10, paddingTop: 14, borderTop: `1px solid ${pink(14)}` })}>
              <div style={label(16, 0.22, pink(68), { lineHeight: 1.35 })}>{S.dressCode}</div>
              <div style={box({ flexWrap: 'wrap', rowGap: 10, width: 384 })}>{dressCells({ name: pink(72), edge: pink(26) }, 384, DRESS_STACK_PER_ROW)}</div>
            </div>
          ) : null}
        </div>
      );
    } else if (t.pass === 'ticket') {
      // The stub between the dashed tear line (988) and the panel edge (1280)
      // holds one row, centred, now that the pill rides on the gate line.
      const b = DRESS_BANDS.ticket;
      pass = hasDress ? (
        <div style={col({ position: 'absolute', left: 130, right: 130, top: 1010 - lift, height: b.row + b.strip, color: th.ink })}>
          <div style={box({ height: b.row, flexShrink: 0, alignItems: 'center', gap: 40 })}>
            {qrBox(196, 12, `0 0 0 2px ${inkP(12)}`)}
            {passText({ label: th.accPn, strong: th.ink, muted: inkP(70), faint: inkP(64) })}
          </div>
          {dressRow({ label: th.accPn, name: inkP(72), edge: inkP(26), rule: inkP(14) }, 820, b.strip)}
        </div>
      ) : (
        <div style={abs({ left: 130, right: 130, top: 1010, height: 250, alignItems: 'center', gap: 40, color: th.ink })}>
          {qrBox(196, 12, `0 0 0 2px ${inkP(12)}`)}
          {passText({ label: th.accPn, strong: th.ink, muted: inkP(70), faint: inkP(64) })}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: CARD_W,
        height: H,
        overflow: 'hidden',
        backgroundColor: th.bg,
        color: th.ink,
        fontFamily: sans,
        fontWeight: th.bw,
        lineHeight: 1.25,
      }}
    >
      {flat(
        <>
          {body}
          {pass}
        </>,
      )}
    </div>
  );
}
