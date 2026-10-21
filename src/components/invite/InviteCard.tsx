import { Children, Fragment, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { ICON_PATHS, isIconName } from '@/lib/invite/icons';
import { placeSlot, type PlacedPhoto } from '@/lib/invite/photo';
import type { QrPath } from '@/lib/invite/qr';
import {
  STR,
  alpha,
  calendar,
  city,
  fit,
  fmtDate,
  mix,
  templateFor,
  theme,
  words,
  type InviteDesign,
  type Lang,
  type SlotKey,
  type Theme,
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
  const seats = S.seats(g.seats || 1);
  const no = g.cardNumber;
  const cityC = city(d.ceremony.addr);
  const H = cover ? COVER_H : CARD_H;

  const fo = { w: th.nw, upper: th.upper };
  const pad = t.fit.pad ?? 0;
  const stText = a.length >= b.length + pad ? a : b + 'xx'.slice(0, pad);
  const gl = g.name.length;
  const fs = {
    st: t.fit.st ? fit(stText, t.fit.st[0], t.fit.st[1], fo) : 100,
    ol: t.fit.ol ? fit(`${a} & ${b}`, t.fit.ol[0], t.fit.ol[1], fo) : 80,
    guest: gl > 34 ? 36 : gl > 24 ? 42 : 48,
    guestS: gl > 24 ? 28 : 32,
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
    const p = placed(key);
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

  let body: ReactNode = null;
  switch (t.id) {
    case 't01':
      body = centerCol({ left: 90, right: 90, top: 90, height: 900, justifyContent: 'center' }, (
        <>
          <div style={label(24, 0.32, ink(72), { marginBottom: 40 })}>{w.host}</div>
          <div style={name(fs.st, 1.02)}>{a}</div>
          <div style={text(72, th.accent, { fontWeight: 200, lineHeight: 1.1, margin: '4px 0' })}>&amp;</div>
          <div style={name(fs.st, 1.02)}>{b}</div>
          <div style={text(34, ink(72), { marginTop: 36, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
          <div style={box({ width: 96, height: 2, backgroundColor: th.accent, margin: '40px 0 32px' })} />
          <div style={label(24, 0.3, ink(72))}>{dt.weekday}</div>
          <div style={text(60, th.ink, { fontWeight: 500, letterSpacing: -1.2, marginTop: 10 })}>{dt.long}</div>
          <div style={text(30, ink(72), { marginTop: 14 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
        </>
      ));
      break;

    case 't02':
      body = (
        <>
          {rule({ left: 36, top: 36, right: 36, bottom: 36, border: `2px solid ${th.accent}` })}
          {rule({ left: 50, top: 50, right: 50, bottom: 50, border: `1px solid ${accT(50)}` })}
          {centerCol({ left: 110, right: 110, top: 100, height: 880, justifyContent: 'center' }, (
            <>
              <div style={box({ position: 'relative', width: 112, height: 68, marginBottom: 40 })}>
                <div style={abs({ left: 0, top: 0, width: 68, height: 68, borderRadius: 34, border: `3px solid ${th.accent}` })} />
                <div style={abs({ left: 44, top: 0, width: 68, height: 68, borderRadius: 34, border: `3px solid ${th.accent}` })} />
              </div>
              <div style={label(24, 0.34, th.accBg, { marginBottom: 40 })}>{w.host}</div>
              <div style={name(fs.st, 1.02)}>{a}</div>
              <div style={text(64, th.accent, { fontWeight: 200, lineHeight: 1.1, margin: '8px 0' })}>&amp;</div>
              <div style={name(fs.st, 1.02)}>{b}</div>
              <div style={text(30, ink(76), { marginTop: 36, maxWidth: 760, justifyContent: 'center' })}>{w.invite}</div>
              <div style={box({ alignItems: 'center', gap: 34, marginTop: 44 })}>
                <div style={label(24, 0.28, th.ink, { width: 230, justifyContent: 'flex-end' })}>{dt.weekday}</div>
                <div style={box({ width: 2, height: 110, backgroundColor: th.accent })} />
                <div style={text(112, th.ink, { fontWeight: 200, lineHeight: 1, letterSpacing: -4.5 })}>{dt.day}</div>
                <div style={box({ width: 2, height: 110, backgroundColor: th.accent })} />
                <div style={label(24, 0.28, th.ink, { width: 230 })}>{`${dt.month} ${dt.year}`}</div>
              </div>
              <div style={text(28, ink(76), { marginTop: 34 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
        </>
      );
      break;

    case 't03':
      body = (
        <>
          {slot('cover', { left: 240, top: 100, width: 600, height: 560 }, { radius: [300, 300, 0, 0], ring: { offset: 16, width: 2, color: th.accent } })}
          {centerCol({ left: 90, right: 90, top: 718 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 20 })}
              <div style={label(24, 0.22, th.ink, { marginTop: 30 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
              <div style={text(28, ink(72), { marginTop: 14 })}>{[d.ceremony.name, cityC].filter(Boolean).join(', ')}</div>
            </>
          ))}
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
            backgroundImage: `linear-gradient(180deg, ${alpha(th.bg, 80)} 0%, ${alpha(th.bg, 38)} 36%, ${alpha(th.bg, 8)} 56%, ${alpha(th.bg, 55)} 78%, ${alpha(th.bg, 85)} 100%)`,
          })}
          {centerCol({ left: 90, right: 90, top: 96 }, (
            <>
              <div style={label(24, 0.34, th.accent, { marginBottom: 34 })}>{w.host}</div>
              <div style={name(fs.st, 0.98)}>{a}</div>
              <div style={text(60, th.accent, { fontWeight: 300, lineHeight: 1.2, margin: '2px 0' })}>&amp;</div>
              <div style={name(fs.st, 0.98)}>{b}</div>
              <div style={label(26, 0.28, th.ink, { marginTop: 36 })}>{dt.dots}</div>
              <div style={text(28, alpha(th.ink, 86), { marginTop: 12 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
        </>
      );
      break;

    case 't05':
      body = (
        <>
          {slot('cover', { left: 540, top: 0, width: 540, height: 1350 })}
          <div style={col({ position: 'absolute', left: 80, top: 90, width: 400, height: 880, alignItems: 'flex-start' })}>
            <div style={box({ alignItems: 'flex-end', fontSize: 150, lineHeight: 0.8, fontWeight: th.nw, letterSpacing: -6, color: th.accent })}>
              <span>{ini.a}</span>
              <span style={{ fontWeight: 200, fontSize: 112, margin: '0 6px', color: ink(40) }}>/</span>
              <span>{ini.b}</span>
            </div>
            <div style={label(22, 0.28, ink(72), { lineHeight: 1.6, margin: '56px 0 24px' })}>{w.host}</div>
            <div style={name(fs.st, 1.02)}>{a}</div>
            <div style={text(48, th.accent, { fontWeight: 200, lineHeight: 1.2 })}>&amp;</div>
            <div style={name(fs.st, 1.02)}>{b}</div>
            <div style={text(28, ink(72), { lineHeight: 1.4, marginTop: 30 })}>{w.invite}</div>
            <div style={col({ marginTop: 'auto', gap: 8 })}>
              <div style={label(22, 0.28, th.accBg)}>{dt.weekday}</div>
              <div style={text(56, th.ink, { fontWeight: 500, letterSpacing: -1.1, lineHeight: 1.05 })}>{`${dt.day} ${dt.month}`}</div>
              <div style={text(28, ink(72))}>{`${dt.year} · ${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </div>
          </div>
        </>
      );
      break;

    case 't06':
      body = (
        <>
          <div style={abs({ left: 120, top: 40, fontSize: 460, lineHeight: 1, fontWeight: th.nw, letterSpacing: -18 })}>{ini.a}</div>
          <div style={abs({ left: 560, top: 330, fontSize: 460, lineHeight: 1, fontWeight: th.nw, letterSpacing: -18 })}>{ini.b}</div>
          {rule({ left: 538, top: 110, width: 2, height: 700, backgroundColor: th.accent, transform: 'rotate(24deg)' })}
          {centerCol({ left: 90, right: 90, top: 836 }, (
            <>
              <div style={label(22, 0.34, th.accBg)}>{S.marrying}</div>
              <div style={{ ...text(fs.ol, th.ink, { fontWeight: 500, letterSpacing: -fs.ol * 0.02, marginTop: 18, whiteSpace: 'nowrap', gap: Math.round(fs.ol * 0.24) }) }}>
                <span>{a}</span>
                <span>&amp;</span>
                <span>{b}</span>
              </div>
              <div style={label(22, 0.22, ink(72), { marginTop: 18 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
            </>
          ))}
        </>
      );
      break;

    case 't07':
      body = centerCol({ left: 90, right: 90, top: 96, height: 900 }, (
        <>
          <div style={label(24, 0.32, ink(72))}>{w.host}</div>
          {oneLine(fs.ol, 1.05, { marginTop: 26 })}
          <div style={text(30, ink(72), { marginTop: 16, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
          <div style={text(500, th.accent, { fontWeight: 200, lineHeight: 0.82, letterSpacing: -30, marginTop: 44 })}>{dt.day}</div>
          <div style={label(34, 0.4, th.ink, { marginTop: 14 })}>{`${dt.month} ${dt.year}`}</div>
          <div style={text(28, ink(72), { marginTop: 22 })}>{`${dt.weekday} · ${d.ceremony.time} · ${d.ceremony.name}`}</div>
        </>
      ));
      break;

    case 't08': {
      const cal = calendar(d.date, lang);
      const cellH = cal.rows > 5 ? 64 : 76;
      const dot = cal.rows > 5 ? 56 : 66;
      // Whole pixels: 7 x 111.43 rounds past 780 and wraps the last weekday.
      const cw = Math.floor(780 / 7);
      body = centerCol({ left: 90, right: 90, top: 86, height: 910 }, (
        <>
          <div style={label(22, 0.32, th.accBg)}>{w.host}</div>
          {oneLine(fs.ol, 1.05, { marginTop: 22 })}
          <div style={text(28, ink(76), { marginTop: 14 })}>{w.invite}</div>
          <div style={col({ width: 780, marginTop: 40, paddingTop: 30, borderTop: `1px solid ${ink(22)}` })}>
            <div style={box({ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, padding: '0 22px' })}>
              <div style={label(28, 0.3, th.ink)}>{dt.month}</div>
              <div style={label(28, 0.3, th.accBg, { textTransform: 'none' })}>{dt.year}</div>
            </div>
            <div style={box({ flexWrap: 'wrap', width: 780 })}>
              {cal.head.map((h, i) => (
                <div key={`h${i}`} style={label(20, 0.1, ink(62), { width: cw, justifyContent: 'center', paddingBottom: 12 })}>
                  {h}
                </div>
              ))}
              {cal.cells.map((c, i) => (
                <div key={`c${i}`} style={box({ width: cw, height: cellH, alignItems: 'center', justifyContent: 'center' })}>
                  <div
                    style={box({
                      width: dot,
                      height: dot,
                      borderRadius: dot / 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 30,
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
          <div style={text(28, ink(76), { marginTop: 22 })}>{`${dt.weekday} · ${d.ceremony.time} · ${d.ceremony.name}`}</div>
        </>
      ));
      break;
    }

    case 't09':
      body = (
        <>
          {slot('cover', { left: 270, top: 96, width: 540, height: 540 }, { radius: [270, 270, 270, 270], ring: { offset: 18, width: 2, color: th.accent } })}
          {centerCol({ left: 90, right: 90, top: 700 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 22 })}
              <div style={text(32, th.ink, { fontWeight: 500, marginTop: 28 })}>{`${dt.weekday}, ${dt.long}`}</div>
              <div style={text(28, ink(72), { marginTop: 10 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
        </>
      );
      break;

    case 't10':
      body = (
        <>
          {slot('cover', { left: 150, top: 90, width: 360, height: 560 }, { radius: [180, 180, 180, 180], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 80 })}
          {slot('second', { left: 570, top: 150, width: 360, height: 560 }, { radius: [180, 180, 180, 180], ring: { offset: 12, width: 2, color: th.accent }, iconSize: 80 })}
          {centerCol({ left: 90, right: 90, top: 770 }, (
            <>
              {oneLine(fs.ol, 1.05)}
              <div style={text(28, ink(72), { marginTop: 18, maxWidth: 860, justifyContent: 'center' })}>{w.invite}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: 26 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
            </>
          ))}
        </>
      );
      break;

    case 't11': {
      const rat = (d.ratiba || []).slice(0, 6);
      const ratH = Math.min(118, Math.floor(600 / Math.max(1, rat.length)));
      body = (
        <>
          {centerCol({ left: 90, right: 90, top: 90 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 22 })}
              <div style={label(24, 0.24, th.accBg, { marginTop: 24 })}>{`${dt.weekday} · ${dt.long}`}</div>
            </>
          ))}
          <div style={col({ position: 'absolute', left: 150, right: 100, top: 340, height: 640, justifyContent: 'center' })}>
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
        </>
      );
      break;
    }

    case 't12':
      body = (
        <>
          <div style={col({ position: 'absolute', left: 90, right: 90, top: 90, alignItems: 'flex-start' })}>
            <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
            <div style={name(fs.st, 1.02, { marginTop: 22 })}>{a}</div>
            <div style={{ ...name(fs.st, 1.02), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={label(22, 0.24, ink(72), { marginTop: 24 })}>{`${dt.weekday} · ${dt.long}`}</div>
          </div>
          {slot('cover', { left: 0, top: 500, width: 1080, height: 360 }, { iconSize: 88 })}
          <div style={box({ position: 'absolute', left: 90, right: 90, top: 896, gap: 60 })}>
            {[
              [w.ceremony, d.ceremony],
              [w.reception, d.reception],
            ].map(([lbl, v], i) => (
              <div key={i} style={col({ flex: 1, gap: 8 })}>
                <div style={label(22, 0.24, th.accBg)}>{`${lbl as string} · ${(v as typeof d.ceremony).time}`}</div>
                <div style={text(30, th.ink, { fontWeight: 500 })}>{(v as typeof d.ceremony).name}</div>
              </div>
            ))}
          </div>
        </>
      );
      break;

    case 't13':
      body = (
        <>
          <div style={abs({ left: 440, top: 80, width: 200, height: 200, borderRadius: 100, backgroundColor: th.accent, alignItems: 'center', justifyContent: 'center', boxShadow: `0 14px 34px ${alpha(th.accent, 34)}` })}>
            <div style={abs({ left: 12, top: 12, width: 176, height: 176, borderRadius: 88, border: `2px solid ${alpha(th.onacc, 55)}` })} />
            <div style={box({ alignItems: 'center', whiteSpace: 'nowrap', fontSize: 62, fontWeight: 300, color: th.onacc, letterSpacing: 1.2 })}>
              <span>{ini.a}</span>
              <span style={{ fontWeight: 200, margin: '0 6px' }}>·</span>
              <span>{ini.b}</span>
            </div>
          </div>
          {centerCol({ left: 90, right: 90, top: 326, height: 670 }, (
            <>
              <div style={label(22, 0.32, ink(72))}>{w.host}</div>
              <div style={name(fs.st, 1.02, { marginTop: 30 })}>{a}</div>
              <div style={text(56, th.accent, { fontWeight: 200, lineHeight: 1.15, margin: '4px 0' })}>&amp;</div>
              <div style={name(fs.st, 1.02)}>{b}</div>
              <div style={text(28, ink(74), { marginTop: 28, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
              <div style={box({ alignItems: 'center', gap: 30, marginTop: 36 })}>
                <div style={label(24, 0.28, th.ink, { width: 220, justifyContent: 'flex-end' })}>{dt.weekday}</div>
                <div style={box({ width: 2, height: 100, backgroundColor: th.accent })} />
                <div style={col({ alignItems: 'center' })}>
                  <div style={text(96, th.ink, { fontWeight: 200, lineHeight: 0.9, letterSpacing: -3.8 })}>{dt.day}</div>
                  <div style={label(22, 0.2, th.ink, { marginTop: 8 })}>{dt.year}</div>
                </div>
                <div style={box({ width: 2, height: 100, backgroundColor: th.accent })} />
                <div style={label(24, 0.28, th.ink, { width: 220 })}>{dt.month}</div>
              </div>
              <div style={text(28, ink(74), { marginTop: 26 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
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
            <div style={name(fs.st, 0.96)}>{a}</div>
            <div style={{ ...name(fs.st, 0.96), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={text(32, ink(72), { lineHeight: 1.4, marginTop: 40, maxWidth: 780 })}>{`${w.host}, ${w.invite}.`}</div>
          </div>
          <div style={box({ position: 'absolute', left: 90, right: 90, top: 690, flexWrap: 'wrap', columnGap: 40, borderTop: `1px solid ${ink(20)}` })}>
            {cell(dt.weekday, dt.long, 0)}
            {cell(w.ceremony, `${d.ceremony.time} · ${d.ceremony.name}`, 1)}
            {cell(w.reception, `${d.reception.time} · ${d.reception.name}`, 2)}
            {cell(cityC, d.ceremony.addr, 3)}
          </div>
        </>
      );
      break;
    }

    case 't15':
      body = (
        <>
          {rule({ left: 70, top: 70, width: 940, height: 1210, borderRadius: 28, backgroundColor: th.panel })}
          {rule({ left: 36, top: 956, width: 68, height: 68, borderRadius: 34, backgroundColor: th.bg })}
          {rule({ left: 976, top: 956, width: 68, height: 68, borderRadius: 34, backgroundColor: th.bg })}
          {rule({ left: 130, right: 130, top: 988, height: 0, borderTop: `3px dashed ${inkP(26)}` })}
          <div style={col({ position: 'absolute', left: 130, right: 130, top: 126, height: 810, color: th.ink })}>
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
            <div style={box({ marginTop: 'auto', alignItems: 'flex-end', gap: 30, paddingTop: 30, borderTop: `1px solid ${inkP(18)}` })}>
              <div style={col({ flex: 1, gap: 6 })}>
                <div style={label(20, 0.24, th.accPn)}>{w.ceremony}</div>
                <div style={text(84, th.ink, { fontWeight: 300, letterSpacing: -2.5, lineHeight: 1 })}>{d.ceremony.time || '--:--'}</div>
                <div style={text(24, inkP(68))}>{d.ceremony.name}</div>
              </div>
              <div style={box({ paddingBottom: 44 })}>
                <svg width={56} height={30} viewBox="0 0 56 30" style={{ display: 'flex' }}>
                  <path d="M2 15h50M40 3l12 12-12 12" fill="none" stroke={th.accPn} strokeWidth={2} />
                </svg>
              </div>
              <div style={col({ flex: 1, gap: 6, alignItems: 'flex-end', textAlign: 'right' })}>
                <div style={label(20, 0.24, th.accPn)}>{w.reception}</div>
                <div style={text(84, th.ink, { fontWeight: 300, letterSpacing: -2.5, lineHeight: 1 })}>{d.reception.time || '--:--'}</div>
                <div style={text(24, inkP(68))}>{d.reception.name}</div>
              </div>
            </div>
            <div style={label(22, 0.26, inkP(68), { justifyContent: 'center', marginTop: 28 })}>{`${dt.weekday} · ${dt.long}`}</div>
          </div>
        </>
      );
      break;

    case 't16': {
      const p = placed('cover');
      body = (
        <>
          <div style={abs({ left: 190, top: 70, width: 700, height: 780, backgroundColor: th.panel, transform: 'rotate(-2.5deg)', boxShadow: '0 30px 70px rgba(26,37,22,0.45)' })}>
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
          {centerCol({ left: 90, right: 90, top: 892 }, (
            <>
              <div style={label(24, 0.26, th.accBg)}>{`${dt.weekday} · ${dt.long}`}</div>
              <div style={text(28, ink(78), { marginTop: 14 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
        </>
      );
      break;
    }

    case 't17':
      body = centerCol({ left: 110, right: 110, top: 80, height: 910 }, (
        <>
          <div style={text(180, th.accent, { lineHeight: 0.8, fontWeight: 200, height: 112 })}>“</div>
          <div style={text(fs.verse, th.ink, { fontWeight: 300, lineHeight: 1.32, letterSpacing: -fs.verse * 0.01, marginTop: 8, justifyContent: 'center' })}>{w.verse}</div>
          {w.verseRef ? <div style={label(22, 0.26, th.accBg, { marginTop: 28 })}>{w.verseRef}</div> : null}
          <div style={box({ width: 80, height: 2, backgroundColor: ink(22), margin: '48px 0' })} />
          <div style={label(22, 0.3, ink(72))}>{w.host}</div>
          {oneLine(fs.ol, 1.05, { marginTop: 20 })}
          <div style={text(28, ink(72), { marginTop: 16, maxWidth: 820, justifyContent: 'center' })}>{w.invite}</div>
          <div style={label(24, 0.22, th.ink, { marginTop: 26 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
        </>
      ));
      break;

    case 't18':
      body = (
        <>
          {slot('cover', { left: 0, top: 0, width: 1080, height: 760 }, { tint: accT(26), iconSize: 110, iconColor: th.accent })}
          {rule({ left: 0, top: 0, width: 1080, height: 770, backgroundImage: `linear-gradient(180deg, ${alpha(th.bg, 30)} 0%, ${alpha(th.bg, 0)} 22%, ${alpha(th.bg, 0)} 42%, ${th.bg} 94%)` })}
          {centerCol({ left: 90, right: 90, top: 676 }, (
            <>
              <div style={label(22, 0.32, th.accBg)}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 24 })}
              <div style={box({ alignItems: 'center', gap: 28, marginTop: 32 })}>
                <div style={box({ width: 120, height: 1, backgroundColor: alpha(th.accent, 60) })} />
                <div style={label(26, 0.3, th.ink, { textTransform: 'none' })}>{dt.dots}</div>
                <div style={box({ width: 120, height: 1, backgroundColor: alpha(th.accent, 60) })} />
              </div>
              <div style={text(28, ink(78), { marginTop: 18 })}>{`${dt.weekday} · ${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </>
          ))}
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
      body = (
        <>
          <div style={abs({ left: 30, top: 30, width: 1020, height: 1290, backgroundColor: th.ink })}>
            <svg width={1020} height={1290} viewBox="0 0 1020 1290" style={{ display: 'flex', position: 'absolute', left: 0, top: 0 }}>
              {dots}
            </svg>
          </div>
          {rule({ left: 68, top: 68, right: 68, bottom: 68, backgroundColor: th.accent })}
          {rule({ left: 70, top: 70, right: 70, bottom: 70, backgroundColor: th.bg })}
          {centerCol({ left: 112, right: 112, top: 108, height: 884 }, (
            <>
              <div style={label(22, 0.32, ink(72))}>{w.host}</div>
              <div style={box({ position: 'relative', width: 250, height: 250, marginTop: 28, alignItems: 'center', justifyContent: 'center' })}>
                <DottedRing size={250} width={9} color={th.accent} />
                <div style={box({ width: 188, height: 188, borderRadius: 94, backgroundColor: th.ink, color: th.bg, alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontSize: 70, fontWeight: 800, letterSpacing: -1.4 })}>
                  {`${ini.a}${ini.b}`}
                </div>
              </div>
              <div style={name(fs.st, 1, { marginTop: 32 })}>{a}</div>
              <div style={text(44, th.accent, { fontWeight: 300, lineHeight: 1.2 })}>&amp;</div>
              <div style={name(fs.st, 1)}>{b}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: 28 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
              <div style={box({ marginTop: 'auto', width: '100%', padding: '18px 0', borderTop: `2px solid ${th.ink}`, borderBottom: `2px solid ${th.ink}`, fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1.25, justifyContent: 'center', textAlign: 'center' })}>
                {w.kanga}
              </div>
            </>
          ))}
        </>
      );
      break;
    }

    case 't20':
      body = (
        <>
          {rule({ left: 156, top: 66, width: 768, height: 648, backgroundColor: th.panel, boxShadow: '0 24px 60px rgba(26,37,22,0.18)' })}
          {slot('cover', { left: 180, top: 90, width: 720, height: 600 })}
          {rule({ left: 532, top: 90, width: 16, height: 600, backgroundColor: th.panel })}
          {rule({ left: 180, top: 382, width: 720, height: 16, backgroundColor: th.panel })}
          {rule({ left: 126, top: 714, width: 828, height: 26, borderRadius: 4, backgroundColor: inkP(16) })}
          {centerCol({ left: 90, right: 90, top: 772 }, (
            <>
              <div style={label(22, 0.3, ink(72))}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 16 })}
              <div style={label(24, 0.22, th.ink, { marginTop: 22 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
              <div style={text(28, ink(72), { marginTop: 10 })}>{[d.ceremony.name, cityC].filter(Boolean).join(', ')}</div>
            </>
          ))}
        </>
      );
      break;

    case 't21': {
      const songTitle = d.music?.title || S.ourSong;
      const songArtist = d.music?.artist || '';
      body = (
        <>
          <div style={abs({ left: 240, top: 70, width: 600, height: 600, borderRadius: 300, boxShadow: `0 30px 70px rgba(0,0,0,0.35)` })}>
            <Vinyl size={600} groove={3} />
          </div>
          {rule({ left: 404, top: 234, width: 272, height: 272, borderRadius: 136, backgroundColor: th.accent })}
          {slot('cover', { left: 410, top: 240, width: 260, height: 260 }, { radius: [130, 130, 130, 130], tint: th.accent })}
          {rule({ left: 531, top: 361, width: 18, height: 18, borderRadius: 9, backgroundColor: th.bg })}
          {centerCol({ left: 90, right: 90, top: 712 }, (
            <>
              <div style={label(22, 0.3, th.accBg)}>{songArtist ? `${S.ourSong} · ${songArtist}` : S.ourSong}</div>
              <div style={text(52, th.ink, { fontWeight: 300, letterSpacing: -1, marginTop: 14, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 900 })}>{`“${songTitle}”`}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 24 })}
              <div style={label(24, 0.22, ink(76), { marginTop: 20 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
            </>
          ))}
        </>
      );
      break;
    }

    case 't22': {
      const stops = (d.story || []).slice(0, 3).map((s) => ({ y: s.y, text: s[lang] || s.sw || s.en || '', last: false }));
      stops.push({ y: dt.short, text: d.ceremony.name, last: true });
      body = (
        <>
          <div style={col({ position: 'absolute', left: 90, top: 96, width: 560, alignItems: 'flex-start' })}>
            <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
            <div style={name(fs.st, 1.02, { marginTop: 26 })}>{a}</div>
            <div style={{ ...name(fs.st, 1.02), gap: Math.round(fs.st * 0.24) }}>
              <span style={{ fontWeight: 200, color: th.accent }}>&amp;</span>
              <span>{b}</span>
            </div>
            <div style={text(30, ink(72), { lineHeight: 1.4, marginTop: 30, maxWidth: 520 })}>{w.invite}</div>
            <div style={label(22, 0.28, th.accBg, { marginTop: 44 })}>{dt.weekday}</div>
            <div style={text(56, th.ink, { fontWeight: 500, letterSpacing: -1.1, marginTop: 8 })}>{dt.long}</div>
            <div style={text(28, ink(72), { marginTop: 10 })}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
          </div>
          <div style={abs({ left: 700, top: 100, width: 300, height: 880 })}>
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

    case 't23':
      body = (
        <>
          {slot('cover', { left: 90, top: 90, width: 548, height: 600 }, { iconSize: 88 })}
          {slot('second', { left: 654, top: 90, width: 336, height: 292 }, { iconSize: 64 })}
          {slot('third', { left: 654, top: 398, width: 336, height: 292 }, { iconSize: 64 })}
          {centerCol({ left: 90, right: 90, top: 728 }, (
            <>
              <div style={label(22, 0.3, th.accBg)}>{w.host}</div>
              {oneLine(fs.ol, 1.05, { marginTop: 16 })}
              <div style={text(28, ink(72), { marginTop: 12 })}>{w.invite}</div>
              <div style={label(24, 0.22, th.ink, { marginTop: 20 })}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
            </>
          ))}
        </>
      );
      break;

    default:
      body = null;
  }

  // ===== Gate passes =====
  const passText = (c: { label: string; strong: string; muted: string; faint: string }, size = fs.guest) => (
    <div style={col({ gap: 10, flex: 1 })}>
      <div style={label(22, 0.26, c.label)}>{S.invFor}</div>
      <div style={text(size, c.strong, { fontWeight: 500, lineHeight: 1.12, letterSpacing: -size * 0.01 })}>{g.name}</div>
      <div style={text(26, c.muted)}>{`${S.card} ${no} · ${seats}`}</div>
      <div style={text(22, c.faint)}>{S.gate}</div>
    </div>
  );

  let pass: ReactNode = null;
  if (!cover) {
    if (t.pass === 'card') {
      pass = (
        <div style={abs({ left: 90, right: 90, top: CARD_H - 80 - 260, height: 260, alignItems: 'center', gap: 40, padding: '0 40px', borderRadius: 24, backgroundColor: th.panel, color: th.pink, border: `2px solid ${pink(10)}` })}>
          {qrBox(196, 12)}
          {passText({ label: pink(68), strong: th.pink, muted: pink(70), faint: pink(62) })}
        </div>
      );
    } else if (t.pass === 'line') {
      pass = (
        <>
          {rule({ left: 90, right: 90, top: 1036, height: 2, backgroundColor: ink(16) })}
          <div style={abs({ left: 90, right: 90, top: CARD_H - 64 - 230, height: 230, alignItems: 'center', gap: 44 })}>
            {qrBox(210, 14, `0 0 0 2px ${ink(12)}`)}
            {passText({ label: ink(70), strong: th.ink, muted: ink(72), faint: ink(66) })}
          </div>
        </>
      );
    } else if (t.pass === 'glass') {
      pass = (
        <div
          style={abs({
            left: 90,
            right: 90,
            top: CARD_H - 80 - 260,
            height: 260,
            alignItems: 'center',
            gap: 40,
            padding: '0 32px',
            borderRadius: 24,
            backgroundColor: alpha(th.bg, web ? 66 : 80),
            border: `2px solid ${alpha(th.ink, 22)}`,
            color: th.ink,
            ...(web ? { backdropFilter: 'blur(16px)' } : {}),
          })}
        >
          {qrBox(196, 12)}
          {passText({ label: th.accent, strong: th.ink, muted: alpha(th.ink, 84), faint: alpha(th.ink, 78) })}
        </div>
      );
    } else if (t.pass === 'stack') {
      pass = (
        <div style={col({ position: 'absolute', left: 60, width: 440, top: CARD_H - 60 - 290, height: 290, justifyContent: 'center', gap: 18, padding: 28, borderRadius: 24, backgroundColor: th.panel, color: th.pink })}>
          <div style={box({ alignItems: 'center', gap: 22 })}>
            {qrBox(150, 10)}
            <div style={col({ flex: 1, gap: 6 })}>
              <div style={label(18, 0.22, pink(68))}>{S.invFor}</div>
              <div style={text(24, pink(72))}>{`${S.card} ${no}`}</div>
              <div style={text(24, pink(72))}>{seats}</div>
            </div>
          </div>
          <div style={text(fs.guestS, th.pink, { fontWeight: 500, lineHeight: 1.15 })}>{g.name}</div>
        </div>
      );
    } else if (t.pass === 'ticket') {
      pass = (
        <div style={abs({ left: 130, right: 130, top: 1040, height: 200, alignItems: 'center', gap: 40, color: th.ink })}>
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
