'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { qrPath } from '@/lib/invite/qr';
import type { CalendarLinks, InviteGuestView, PublicCollectionAccount, PublicStoryExtras } from '@/lib/invite/types';
import {
  STR,
  attireOf,
  calendar,
  city,
  cropFor,
  fit,
  fmtDate,
  mix,
  page,
  photo,
  telUrl,
  theme,
  waUrl,
  words,
  type InviteDesign,
  type Lang,
  type SectionKey,
} from '@/lib/invite/wcz';
import { InviteCard } from './InviteCard';
import { ScaledCard } from './ScaledCard';
import { Attire } from './page/Attire';
import { Countdown } from './page/Countdown';
import { EntryPass, EntryPassButton, EntryPassDialog } from './page/EntryPass';
import { Icon } from './page/Icon';
import { Michango } from './page/Michango';
import { Notes } from './page/Notes';
import { PageHead } from './page/PageHead';
import { Photo } from './page/Photo';
import { Rsvp, type SavedReply } from './page/Rsvp';
import { Venues } from './page/Venues';
import { Wishes } from './page/Wishes';
import { createDemoMelody, spotifyEmbed, streamKind } from './page/music';
import { PalContext, labelStyle, monoStyle, nameStyle, palette, usePal, type Pal } from './page/palette';

export interface InvitePageProps {
  design: InviteDesign;
  /** The guest's personal link token; null on the public story page. */
  token: string | null;
  guest: InviteGuestView | null;
  /** The invitation's API status (invited, accepted, maybe, declined, expired). */
  status: string;
  reply: SavedReply | null;
  rsvpOpen: boolean;
  calendar: CalendarLinks | null;
  /** What the gate pass QR holds: the guest's RSVP link, which the gate scanner reads. */
  rsvpUrl: string | null;
  accounts: PublicCollectionAccount[];
  extras: PublicStoryExtras | null;
  /** The story page slug, for the guestbook. */
  slug: string | null;
  guestbook: { id: string; name: string; message: string; createdAt?: string }[];
  /** The guest's card as an image, for "Save card". */
  cardPngUrl: string | null;
}

/**
 * splash: the couple's monogram with "Opening your invitation", a moment
 * long; closed: the template's opening waits for a tap; opening: it plays;
 * open: the page.
 */
type Stage = 'splash' | 'closed' | 'opening' | 'open';

/** How long the splash shows before the opening waits for the tap. */
const SPLASH_MS = 1700;

const CSS = `
@keyframes wi-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes wi-eq { from { transform: scaleY(0.3) } to { transform: scaleY(1) } }
@keyframes wi-in { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
@keyframes wi-ring { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
@keyframes wi-fadein { from { opacity: 0 } to { opacity: 1 } }
@keyframes wi-pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.04) } }
.wi-ring { animation: wi-ring 1.1s linear infinite; }
.wi-splash { animation: wi-fadein 500ms ease both; }
.wi-pulse { animation: wi-pulse 1.8s ease-in-out infinite; }
.wi-spin { animation: wi-spin 5.2s linear infinite; animation-play-state: paused; }
.wi-eq { animation: wi-eq 0.4s ease-in-out infinite alternate; animation-play-state: paused; transform-origin: 50% 100%; }
.wi-eq:nth-child(2) { animation-duration: 0.53s } .wi-eq:nth-child(3) { animation-duration: 0.68s }
[data-playing="1"] .wi-spin, [data-playing="1"] .wi-eq, [data-stage="opening"] .wi-spin { animation-play-state: running; }
.wi-in { animation: wi-in 650ms cubic-bezier(.2,.7,.2,1) both; }
body:has([data-invite-page]) > header, body:has([data-invite-page]) > footer { display: none; }
@media (prefers-reduced-motion: reduce) { .wi-spin, .wi-eq, .wi-in, .wi-ring, .wi-splash, .wi-pulse { animation: none !important; } }
`;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => x[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * The guest web invitation: the opening animation for the template, the hero,
 * every section in the recipe's order and style, the gate pass, and the
 * couple's music. One component for the personal invitation (/rsvp/:token)
 * and the public story page (/:slug); without a token it shows where to pay
 * and where the personal link is, and nothing personal.
 */
export function InvitePage(props: InvitePageProps) {
  const d = props.design;
  const t = d.tpl;
  const rc = page(d, t);
  const th = theme(d, t);
  const [lang, setLang] = useState<Lang>(d.lang);
  const S = STR[lang];
  const SO = STR[lang === 'sw' ? 'en' : 'sw'];
  const w = words(d, lang);
  const dt = fmtDate(d.date, lang);
  const a = d.names.a || '';
  const b = d.names.b || '';
  const ini = { a: (a[0] ?? '').toUpperCase(), b: (b[0] ?? '').toUpperCase() };
  const P = useMemo(() => palette(th), [th]);
  const PI = useMemo(() => palette(th, true), [th]);
  const guest = props.guest;
  const guestName = guest?.name ?? `${a} & ${b}`;

  // ===== Opening =====
  const [stage, setStage] = useState<Stage>(rc.open === 'none' ? 'open' : 'splash');
  const [vh, setVh] = useState(760);
  useEffect(() => {
    setVh(window.innerHeight || 760);
  }, []);
  useEffect(() => {
    if (stage !== 'splash') return;
    const t = setTimeout(() => setStage('closed'), SPLASH_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // ===== Music =====
  const m = d.music;
  const file = m.on && m.file ? m.file : null;
  const demo = useRef<ReturnType<typeof createDemoMelody> | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const musicOn = m.on && (file !== null || m.demo);
  const [playing, setPlaying] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const openPass = useCallback(() => setPassOpen(true), []);
  const closePass = useCallback(() => setPassOpen(false), []);
  const kind = m.link ? streamKind(m.link) : null;
  const embed = m.link ? spotifyEmbed(m.link) : null;

  const play = useCallback(() => {
    if (!musicOn) return;
    if (file !== null && audio.current !== null) {
      audio.current.volume = 0.7;
      const pr = audio.current.play();
      setPlaying(true);
      if (pr !== undefined) pr.catch(() => setPlaying(false));
    } else if (m.demo) {
      demo.current ??= createDemoMelody();
      if (demo.current.start()) setPlaying(true);
    }
  }, [file, m.demo, musicOn]);
  const pause = useCallback(() => {
    audio.current?.pause();
    demo.current?.stop();
    setPlaying(false);
  }, []);
  useEffect(() => () => demo.current?.stop(), []);

  const openNow = () => {
    if (stage !== 'closed') return;
    if (m.auto) play();
    setStage('opening');
    setTimeout(() => setStage('open'), 1250);
  };

  // ===== Reveal on scroll =====
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stage === 'closed' || typeof IntersectionObserver === 'undefined') return;
    const el = root.current;
    if (el === null) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.classList.add('wi-in');
        }),
      { threshold: 0.08 },
    );
    el.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [stage, lang]);

  // ===== Data for the sections =====
  const coverPh = photo(d, d.slots.cover);
  const coverCrop = cropFor(d, t, 'cover');
  const gal = d.gallery.map((it) => ({ it, ph: photo(d, it.pid) })).filter((x) => x.ph !== null);
  const extras = props.extras;
  const hasStory = d.story.length > 0 || (extras?.ourStory ?? '') !== '';
  const hasMichangoNumbers = props.accounts.length > 0 || d.michango.mpesa !== '' || d.michango.tigo !== '' || d.michango.airtel !== '';
  const future = Date.now() < Date.UTC(Number(d.date.slice(0, 4)), Number(d.date.slice(5, 7)) - 1, Number(d.date.slice(8, 10)) + 1);
  const attire = attireOf(d);
  const avail: Record<SectionKey, boolean> = {
    rsvp: props.token !== null || (extras?.rsvpOpen ?? true),
    song: musicOn || kind !== null,
    countdown: future,
    quote: w.quote !== '',
    calendar: true,
    verse: w.verse !== '',
    ratiba: d.ratiba.length > 0,
    venues: d.ceremony.name !== '' || d.reception.name !== '',
    dress: attire.length > 0,
    story: hasStory,
    gallery: gal.length > 0,
    michango: props.token !== null || hasMichangoNumbers,
    kamati: d.kamati.length > 0,
    notes: true,
    wishes: props.slug !== null,
  };
  const keys = rc.order.filter((k) => d.sections[k] !== false && avail[k]);

  // Extra sections from the story page, styled like the rest.
  type Extra = { k: 'faqs' | 'party' | 'gifts' | 'travel'; node: ReactNode };
  const extraList: Extra[] = [];
  if (extras !== null) {
    if (extras.faqs.length > 0) extraList.push({ k: 'faqs', node: <Faqs items={extras.faqs} /> });
    if (extras.weddingParty.length > 0) extraList.push({ k: 'party', node: <Party items={extras.weddingParty} /> });
    if ((extras.registryNote ?? '') !== '') extraList.push({ k: 'gifts', node: <Note text={extras.registryNote ?? ''} /> });
    if ((extras.travelNote ?? '') !== '') extraList.push({ k: 'travel', node: <Note text={extras.travelNote ?? ''} /> });
  }
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const total = keys.length + extraList.length;
  const wrapFor = (i: number): { style: CSSProperties; inv: boolean } => {
    if (rc.rhythm === 'cards') return { style: { margin: '12px 14px', padding: '30px 20px', borderRadius: 24, background: P.acc_(8), boxShadow: `inset 0 0 0 1px ${P.ink_(10)}` }, inv: false };
    if (rc.rhythm === 'bands') return { style: { padding: '48px 24px' }, inv: i % 2 === 1 };
    if (rc.rhythm === 'rules') return { style: { margin: '0 24px', padding: '46px 0', borderTop: i > 0 ? `1px solid ${P.ink_(16)}` : 'none' }, inv: false };
    return { style: { padding: '44px 24px', background: i % 2 ? P.acc_(9) : P.bg }, inv: false };
  };

  const section = (i: number, k: string, h: string, kk: string, body: ReactNode) => {
    const wr = wrapFor(i);
    const pal = wr.inv ? PI : P;
    return (
      <PalContext.Provider key={k} value={pal}>
        <section id={`sec-${k}`} data-section={k} data-reveal="1" aria-label={h} style={{ position: 'relative', scrollMarginTop: 56, color: pal.ink, ...wr.style, ...(wr.inv ? { background: pal.bg } : {}) }}>
          <PageHead v={rc.head} k={kk} h={h} n={String(i + 1).padStart(2, '0')} />
          {body}
        </section>
      </PalContext.Provider>
    );
  };

  const playerIcon = playing ? 'Pause' : 'PlayArrow';
  const playerLabel = playing ? S.pause : S.play;
  const toggle = () => (playing ? pause() : play());
  const songTitle = m.title || S.ourSong;
  const songArtist = m.artist || `${a} & ${b}`;

  const vinyl = (size: number, label: number, extra: CSSProperties = {}) => (
    <div className="wi-spin" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'repeating-radial-gradient(circle at 50% 50%, #10170E 0 2px, #1E2B1A 2px 4px)', ...extra }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: label, height: label, margin: `-${label / 2}px 0 0 -${label / 2}px`, borderRadius: '50%', overflow: 'hidden', background: P.accent }}>
        <Photo ph={coverPh} crop={coverCrop} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: size / 24, height: size / 24, margin: `-${size / 48}px 0 0 -${size / 48}px`, borderRadius: '50%', background: P.bg }} />
    </div>
  );

  const body = (k: SectionKey): ReactNode => {
    switch (k) {
      case 'rsvp':
        return (
          <Rsvp d={d} lang={lang} view={rc.rsvp} rhythm={rc.rhythm} token={props.token} guest={guest} status={props.status} reply={props.reply} rsvpOpen={props.rsvpOpen} calendar={props.calendar} />
        );
      case 'song':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
            {musicOn && (
              <>
                <div style={{ position: 'relative', width: 168, height: 168 }}>
                  {vinyl(168, 66, { boxShadow: '0 16px 40px rgba(26,37,22,0.35)' })}
                  <button type="button" onClick={toggle} aria-label={playerLabel} style={{ position: 'absolute', right: -6, bottom: -4, width: 56, height: 56, borderRadius: '50%', border: 0, cursor: 'pointer', background: P.accent, color: P.onacc, display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(26,37,22,0.3)' }}>
                    <Icon name={playerIcon} size={28} />
                  </button>
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>{songTitle}</div>
                <div style={{ ...monoStyle(P, 11, 0.1, P.ink_(70)), textTransform: 'uppercase' }}>{songArtist}</div>
                <Eq height={22} width={4} n={4} color={P.accent} />
              </>
            )}
            {/* Spotify plays only inside its own player and only when the guest
                presses play; it cannot be the page's background music. */}
            {embed !== null && (
              <iframe
                title={songTitle}
                src={embed}
                width="100%"
                height={152}
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                // In this centred column a replaced element shrinks to its own
                // 300px-ish width; stretch it to the column instead.
                style={{ border: 0, borderRadius: 12, alignSelf: 'stretch', width: '100%', maxWidth: 400, marginInline: 'auto' }}
              />
            )}
            {kind !== null && (
              <a href={m.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: P.ink, textUnderlineOffset: 3 }}>
                {S.listen} →
              </a>
            )}
          </div>
        );
      case 'countdown':
        return (
          <>
            <Countdown d={d} lang={lang} view={rc.count} />
            {w.tagline !== '' && <div style={{ textAlign: 'center', fontSize: 17, fontStyle: 'italic', fontWeight: 300, marginTop: 18, color: P.ink_(78) }}>{w.tagline}</div>}
          </>
        );
      case 'quote':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 8px' }}>
            <div aria-hidden style={{ width: 1, height: 26, background: P.accBg, opacity: 0.6, marginBottom: 18 }} />
            <p style={{ fontSize: 19, fontWeight: 300, lineHeight: 1.55, fontStyle: 'italic', textWrap: 'balance', margin: 0 }}>{`“${w.quote}”`}</p>
            {w.quoteBy !== '' && <div style={{ fontSize: 15, fontStyle: 'italic', color: P.ink_(72), marginTop: 18 }}>{w.quoteBy}</div>}
          </div>
        );
      case 'calendar':
        return <CalendarBlock d={d} lang={lang} links={props.calendar} />;
      case 'verse':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 8px' }}>
            <div aria-hidden style={{ fontSize: 64, lineHeight: 0.7, height: 34, fontWeight: 200, color: P.accent }}>“</div>
            <p style={{ fontSize: 21, fontWeight: 300, lineHeight: 1.45, textWrap: 'balance', margin: '10px 0 0' }}>{w.verse}</p>
            {w.verseRef !== '' && <div style={{ ...labelStyle(P, 11, 0.22, P.accBg), marginTop: 14 }}>{w.verseRef}</div>}
          </div>
        );
      case 'ratiba':
        return <Programme d={d} lang={lang} view={rc.ratiba} />;
      case 'venues':
        return (
          <Venues
            lang={lang}
            items={[
              { label: w.ceremony, kind: 'ceremony' as const, v: d.ceremony },
              { label: w.reception, kind: 'reception' as const, v: d.reception },
            ].filter((x) => x.v.name !== '')}
          />
        );
      case 'dress':
        return <Attire items={attire} lang={lang} note={w.dressNote} />;
      case 'notes':
        return <Notes d={d} lang={lang} />;
      case 'wishes':
        return props.slug === null ? null : (
          <Wishes slug={props.slug} couple={`${a} & ${b}`} lang={lang} initial={props.guestbook} guestName={guest?.name ?? null} onUpdateResponse={props.token !== null && keys.includes('rsvp') ? () => scrollTo('sec-rsvp') : null} />
        );
      case 'story':
        return (
          <div>
            {(extras?.ourStory ?? '') !== '' && <p style={{ fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: '0 0 22px' }}>{extras?.ourStory}</p>}
            {d.story.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10, borderLeft: `1px solid ${P.ink_(18)}` }}>
                {d.story.map((st, i) => (
                  <div key={i} style={{ position: 'relative', padding: '0 0 22px 24px' }}>
                    <div style={{ position: 'absolute', left: -5, top: 5, width: 9, height: 9, borderRadius: '50%', background: P.accent }} />
                    <div style={{ ...labelStyle(P, 12, 0.14, P.accBg), textTransform: 'none', fontVariantNumeric: 'tabular-nums' }}>{st.y}</div>
                    <div style={{ fontSize: 16, marginTop: 4 }}>{st[lang] || st.sw || st.en}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'gallery':
        return <Gallery d={d} view={rc.gallery} items={gal.map((x) => ({ ph: x.ph, crop: x.it.crop }))} />;
      case 'michango':
        return <Michango d={d} lang={lang} token={props.token} guest={guest} accounts={props.accounts} />;
      case 'kamati': {
        const waText = lang === 'sw' ? `Habari, nina swali kuhusu harusi ya ${a} & ${b}.` : `Hello, I have a question about ${a} & ${b}’s wedding.`;
        return (
          <div>
            {d.kamati.map((k, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: `1px solid ${P.ink_(12)}` }}>
                <div style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', background: P.acc_(22), ...monoStyle(P, 11, 0), fontWeight: 600 }}>{initials(k.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{k.name}</div>
                  <div style={monoStyle(P, 11, 0, P.ink_(70))}>{[k[lang] || k.sw, k.phone].filter(Boolean).join(' · ')}</div>
                </div>
                {k.phone !== '' && (
                  <>
                    <a href={telUrl(k.phone)} aria-label={`${S.call} ${k.name}`} style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', color: P.ink, boxShadow: `inset 0 0 0 1px ${P.ink_(26)}` }}>
                      <Icon name="Call" size={18} />
                    </a>
                    <a href={waUrl(k.phone, waText)} target="_blank" rel="noopener noreferrer" aria-label={`${S.chat} ${k.name}`} style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', background: P.accent, color: P.onacc }}>
                      <Icon name="Chat" size={18} />
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const op = stage !== 'open';
  const anim = stage === 'opening';
  // With only a streaming link (no uploaded song), "Tap for music" takes the
  // guest to the song section, where Spotify's own player sits.
  const linkOnly = !musicOn && m.on && kind !== null && keys.includes('song');
  const musicPill = musicOn || linkOnly ? (
    <button
      type="button"
      onClick={musicOn ? toggle : () => scrollTo('sec-song')}
      data-music-pill="1"
      className={playing ? undefined : 'wi-pulse'}
      aria-label={musicOn ? (playing ? S.pause : S.play) : S.tapMusic}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.45)', cursor: 'pointer', background: 'rgba(26,37,22,0.55)', color: '#FFFFFF', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', fontFamily: P.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
    >
      <Icon name={playing ? 'Pause' : 'MusicNote'} size={14} />
      {playing ? S.musicPlaying : S.tapMusic}
    </button>
  ) : null;
  const overlayText = { photo: '#FFFFFF', curtain: th.onacc, unfold: th.bg }[rc.open as string] ?? P.ink;
  const longer = a.length >= b.length + 2 ? a : `${b}xx`;
  const leftHero = rc.head === 'left' || rc.head === 'num';
  const heroH = Math.max(520, Math.min(720, vh - 30));
  const qr = props.rsvpUrl !== null ? qrPath(props.rsvpUrl) : null;
  const stops = d.story.slice(0, 3).map((s) => ({ y: s.y, text: s[lang] || s.sw || s.en || '', last: false }));
  stops.push({ y: dt.long, text: `${d.ceremony.name} · ${d.ceremony.time}`, last: true });

  return (
    <PalContext.Provider value={P}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={root}
        data-invite-page="1"
        data-playing={playing ? '1' : '0'}
        data-stage={stage}
        lang={lang}
        style={{
          minHeight: '100vh',
          background: P.bg,
          color: P.ink,
          fontFamily: P.sans,
          fontWeight: th.bw,
          lineHeight: 1.45,
          ...(stage === 'closed' || stage === 'splash' ? { height: '100vh', overflow: 'hidden' } : {}),
        }}
      >
        {file !== null && <audio ref={audio} src={file} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />}
        <noscript>
          <style>{'[data-invite-overlay]{display:none!important}[data-invite-page]{height:auto!important;overflow:visible!important}'}</style>
        </noscript>
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', overflowX: 'clip' }}>
          {stage === 'splash' && <Splash P={P} h={Math.max(560, vh)} ini={ini} names={{ a, b }} label={S.openingInvite} host={w.host} />}
          {op && stage !== 'splash' && (
            <Opening
              kind={rc.open}
              anim={anim}
              h={Math.max(560, vh)}
              onOpen={openNow}
              P={P}
              names={{ a, b }}
              ini={ini}
              host={w.host}
              dots={dt.dots}
              cardNo={guest?.cardNumber ?? d.code}
              S={S}
              forName={guest !== null ? `${S.forLabel} · ${guest.name}` : `${a} & ${b}`}
              textColor={overlayText}
              music={musicOn}
              songTitle={songTitle}
              coverPh={coverPh}
              coverCrop={coverCrop}
              vinyl={vinyl}
            />
          )}

          {/* Header */}
          <div style={{ position: 'sticky', top: 0, zIndex: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 16px', background: `${P.bg}D6`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid ${P.ink_(12)}` }}>
            <div style={{ ...labelStyle(P, 11, 0.14, P.ink), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{`${ini.a} & ${ini.b} · ${dt.short}`}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {musicOn && rc.player === 'bar' && (
                <button type="button" onClick={toggle} aria-label={playerLabel} style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 150, minWidth: 0, padding: '5px 12px 5px 6px', borderRadius: 999, border: 0, cursor: 'pointer', background: P.accent, color: P.onacc, fontFamily: P.sans, fontSize: 12, fontWeight: 600 }}>
                  <Icon name={playerIcon} size={18} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songTitle}</span>
                </button>
              )}
              <div role="group" aria-label="Language" style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 999, flex: 'none', boxShadow: `inset 0 0 0 1px ${P.ink_(18)}` }}>
                {(['sw', 'en'] as const).map((l) => (
                  <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} style={{ border: 0, cursor: 'pointer', padding: '5px 10px', borderRadius: 999, fontFamily: P.mono, fontSize: 11, background: lang === l ? P.ink : 'transparent', color: lang === l ? P.bg : P.ink }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero */}
          {rc.hero === 'card' && (
            <ScaledCard cover initialWidth={375}>
              <InviteCard design={d} lang={lang} guest={null} qr={qr ?? { vb: '0 0 1 1', d: '' }} cover web />
            </ScaledCard>
          )}
          {rc.hero === 'photo' && (
            <div style={{ position: 'relative', height: heroH, background: P.accent, overflow: 'hidden' }}>
              <Photo ph={coverPh} crop={coverCrop} eager />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,37,22,0.3) 0%, transparent 28%, transparent 50%, rgba(26,37,22,0.86) 100%)' }} />
              <div style={{ position: 'absolute', left: 24, right: 24, bottom: 34, color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={labelStyle(P, 11, 0.24, '#E8D9B8')}>{w.host}</div>
                <h1 style={{ ...nameStyle(P, fit(longer, 340, 72, { w: th.nw, upper: th.upper }), 0.98), margin: 0 }}>
                  {a}
                  <br />
                  <span style={{ fontWeight: 200 }}>&amp;</span> {b}
                </h1>
                <div style={monoStyle(P, 12, 0.16)}>{[dt.dots, d.ceremony.time, city(d.ceremony.addr)].filter(Boolean).join(' · ')}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 6 }}>
                  <div style={{ ...labelStyle(P, 9, 0.22, 'rgba(255,255,255,0.75)') }}>{S.scrollDiscover}</div>
                  {musicPill}
                </div>
              </div>
            </div>
          )}
          {rc.hero === 'type' && (
            <div style={{ padding: '64px 24px 44px', display: 'flex', flexDirection: 'column', alignItems: leftHero ? 'flex-start' : 'center', textAlign: leftHero ? 'left' : 'center', gap: 14, borderBottom: `1px solid ${P.ink_(14)}` }}>
              <div style={labelStyle(P, 11, 0.24, P.accBg)}>{w.host}</div>
              <h1 style={{ ...nameStyle(P, fit(longer, 350, 88, { w: th.nw, upper: th.upper }), 0.95), margin: 0 }}>
                {a}
                <br />
                <span style={{ fontWeight: 200, color: P.accent }}>&amp;</span> {b}
              </h1>
              <div style={{ fontSize: 16, color: P.ink_(74), maxWidth: 360 }}>{w.invite}</div>
              <div style={{ width: 56, height: 2, background: P.accent, margin: '8px 0' }} />
              <div style={{ ...monoStyle(P, 13, 0.14), textTransform: 'uppercase' }}>{`${dt.weekday} · ${dt.long}`}</div>
              <div style={{ fontSize: 14, color: P.ink_(74) }}>{`${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </div>
          )}
          {rc.hero === 'date' && (
            <div style={{ padding: '56px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={labelStyle(P, 11, 0.24, P.ink_(72))}>{w.host}</div>
              <h1 style={{ ...nameStyle(P, 26, 1.1), margin: '14px 0 0' }}>
                {a} <span style={{ color: P.accent, fontWeight: 200 }}>&amp;</span> {b}
              </h1>
              <div style={{ fontSize: 200, lineHeight: 0.85, fontWeight: 200, letterSpacing: '-0.07em', color: P.accent, marginTop: 22, fontVariantNumeric: 'tabular-nums' }}>{dt.day}</div>
              <div style={{ ...monoStyle(P, 16, 0.36), textTransform: 'uppercase', marginTop: 8 }}>{`${dt.month} ${dt.year}`}</div>
              <div style={{ fontSize: 14, color: P.ink_(72), marginTop: 12 }}>{`${dt.weekday} · ${d.ceremony.time} · ${d.ceremony.name}`}</div>
            </div>
          )}
          {rc.hero === 'vinyl' && (
            <div style={{ padding: '44px 24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 290, height: 290 }}>
                {vinyl(290, 120, { boxShadow: '0 24px 60px rgba(26,37,22,0.42)' })}
                {musicOn && (
                  <button type="button" onClick={toggle} aria-label={playerLabel} style={{ position: 'absolute', right: -4, bottom: 6, width: 64, height: 64, borderRadius: '50%', border: 0, cursor: 'pointer', background: P.accent, color: P.onacc, display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(26,37,22,0.35)' }}>
                    <Icon name={playerIcon} size={30} />
                  </button>
                )}
              </div>
              <div>
                <div style={labelStyle(P, 11, 0.22, P.accBg)}>{`${S.ourSong} · ${songArtist}`}</div>
                <div style={{ fontSize: 24, fontWeight: 300, marginTop: 6 }}>{`“${songTitle}”`}</div>
              </div>
              <h1 style={{ ...nameStyle(P, 34, 1.05), margin: 0 }}>
                {a} <span style={{ color: P.accent, fontWeight: 200 }}>&amp;</span> {b}
              </h1>
              <div style={{ ...monoStyle(P, 12, 0.16, P.ink_(74)), textTransform: 'uppercase' }}>{`${dt.weekday} · ${dt.long} · ${d.ceremony.time}`}</div>
            </div>
          )}
          {rc.hero === 'route' && (
            <div style={{ padding: '56px 24px 40px' }}>
              <div style={labelStyle(P, 11, 0.24, P.accBg)}>{w.host}</div>
              <h1 style={{ ...nameStyle(P, fit(longer, 350, 88, { w: th.nw, upper: th.upper }), 0.98), margin: '14px 0 0' }}>
                {a}
                <br />
                <span style={{ fontWeight: 200, color: P.accent }}>&amp;</span> {b}
              </h1>
              <div style={{ ...labelStyle(P, 11, 0.22, P.ink_(66)), marginTop: 34 }}>{S.route}</div>
              <div style={{ position: 'relative', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ position: 'absolute', left: 8, top: 8, bottom: 12, width: 2, background: P.ink_(18) }} />
                {stops.map((st, i) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 34 }}>
                    <div style={{ position: 'absolute', left: st.last ? -2 : 0, top: st.last ? 0 : 2, width: st.last ? 22 : 18, height: st.last ? 22 : 18, borderRadius: '50%', border: `2px solid ${P.accent}`, background: st.last ? P.accent : P.bg, boxShadow: `0 0 0 4px ${P.bg}` }} />
                    <div style={monoStyle(P, 12, 0.1, P.accBg)}>{st.y}</div>
                    <div style={{ fontSize: 16, marginTop: 2, fontWeight: st.last ? 700 : 400 }}>{st.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Under every hero but the full photo (which carries them itself): scroll hint and the music pill */}
          {rc.hero !== 'photo' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 24px 0' }}>
              <div style={labelStyle(P, 9, 0.22, P.ink_(55))}>{S.scrollDiscover}</div>
              {musicPill !== null && <span style={{ display: 'inline-flex', borderRadius: 999, background: P.ink }}>{musicPill}</span>}
            </div>
          )}

          {/* Welcome */}
          <div style={{ padding: '30px 24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <div style={labelStyle(P, 11, 0.22, P.accBg)}>{S.welcome}</div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', textWrap: 'balance' }}>{guest?.name ?? S.guestFallback}</div>
            <div style={{ fontSize: 15, color: P.ink_(72), maxWidth: 380, textWrap: 'pretty' }}>{`${a} & ${b} ${w.invite}.`}</div>
            {(extras?.welcomeMessage ?? '') !== '' && <p style={{ fontSize: 15, color: P.ink_(80), maxWidth: 380, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{extras?.welcomeMessage}</p>}
          </div>

          {keys.map((k, i) =>
            section(i, k, k === 'calendar' ? dt.month : S.H[k], k === 'calendar' ? dt.year : k === 'rsvp' ? `RSVP · ${SO.H.rsvp}` : SO.H[k], body(k)),
          )}
          {extraList.map((x, j) => section(keys.length + j, x.k, S.H[x.k], SO.H[x.k], x.node))}

          {/* Entry pass: only on a personal invitation */}
          {guest !== null && qr !== null && (
            <div data-reveal="1" style={{ padding: '44px 24px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '100%' }}>
                <PageHead v={rc.head} k={SO.H.pass} h={S.H.pass} n={String(total + 1).padStart(2, '0')} />
              </div>
              <EntryPass guest={guest} qr={qr} lang={lang} cardPngUrl={props.cardPngUrl} onEnlarge={openPass} />
            </div>
          )}

          {/* Closing */}
          <div style={{ padding: '28px 24px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', borderTop: `1px solid ${P.ink_(12)}` }}>
            <div style={{ fontSize: 15, color: P.ink_(76) }}>{w.closing}</div>
            <div style={nameStyle(P, 24, 1.15)}>{`${a} & ${b}`}</div>
            {(extras?.hashtag ?? '') !== '' && <div style={{ ...monoStyle(P, 13, 0.14, P.accBg), textTransform: 'uppercase', marginTop: 4 }}>{`#${(extras?.hashtag ?? '').replace(/^#/, '')}`}</div>}
            <a href="/app" style={{ marginTop: 14, fontSize: 13, color: P.ink, textUnderlineOffset: 3 }}>{S.getApp}</a>
            <div style={{ ...monoStyle(P, 10, 0.14, P.ink_(60)), textTransform: 'uppercase', marginTop: 10 }}>{S.madeWith}</div>
          </div>

          {/* What floats: the entry pass button at the left, the player at the right */}
          {stage === 'open' && (guest !== null && qr !== null || (musicOn && rc.player !== 'bar')) && (
            <div style={{ position: 'sticky', bottom: 14, zIndex: 9, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, padding: '0 14px 4px', pointerEvents: 'none' }}>
              <div>{guest !== null && qr !== null && <EntryPassButton lang={lang} onOpen={openPass} />}</div>
              {musicOn && rc.player === 'pill' && (
                <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10, maxWidth: '58%', minWidth: 0, padding: '6px 6px 6px 14px', borderRadius: 999, background: `${P.ink}E6`, color: P.bg, boxShadow: '0 12px 30px rgba(26,37,22,0.28)', backdropFilter: 'blur(8px)' }}>
                  <Eq height={16} width={3} n={3} color={P.accent} />
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songTitle}</span>
                    <span style={{ ...monoStyle(P, 9, 0.08), textTransform: 'uppercase', opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{songArtist}</span>
                  </div>
                  <button type="button" onClick={toggle} aria-label={playerLabel} style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', border: 0, cursor: 'pointer', background: P.accent, color: P.onacc, display: 'grid', placeItems: 'center' }}>
                    <Icon name={playerIcon} size={20} />
                  </button>
                </div>
              )}
              {musicOn && rc.player === 'disc' && (
                <button type="button" onClick={toggle} aria-label={playerLabel} style={{ pointerEvents: 'auto', position: 'relative', width: 56, height: 56, flex: 'none', borderRadius: '50%', border: 0, padding: 0, cursor: 'pointer', background: 'none', boxShadow: '0 10px 26px rgba(26,37,22,0.35)' }}>
                  {vinyl(56, 22)}
                  <span style={{ position: 'absolute', right: -4, bottom: -4, width: 26, height: 26, borderRadius: '50%', background: P.accent, color: P.onacc, display: 'grid', placeItems: 'center' }}>
                    <Icon name={playerIcon} size={16} />
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
        {passOpen && guest !== null && qr !== null && <EntryPassDialog guest={guest} qr={qr} lang={lang} onClose={closePass} />}
      </div>
    </PalContext.Provider>
  );
}

function Eq({ height, width, n, color }: { height: number; width: number; n: number; color: string }) {
  const base = [0.35, 0.6, 0.45, 0.8];
  return (
    <div aria-hidden style={{ display: 'flex', alignItems: 'flex-end', gap: width, height, flex: 'none' }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="wi-eq" style={{ display: 'block', width, height, borderRadius: 2, background: color, transform: `scaleY(${base[i % 4]})` }} />
      ))}
    </div>
  );
}

function CalendarBlock({ d, lang, links }: { d: InviteDesign; lang: Lang; links: CalendarLinks | null }) {
  const S = STR[lang];
  const cal = calendar(d.date, lang);
  const dt = fmtDate(d.date, lang);
  const P = usePal();
  const siteUrl = typeof window === 'undefined' ? 'https://wedding.co.tz' : window.location.href;
  const [fallback, setFallback] = useState<{ googleUrl: string; icsUrl: string } | null>(null);
  useEffect(() => {
    if (links !== null) return;
    void import('@/lib/invite/calendar').then((m) => setFallback(m.calendarLinks(d, siteUrl)));
  }, [d, links, siteUrl]);
  const l = links ?? fallback;
  const btn: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', textDecoration: 'none', color: 'inherit', boxShadow: `inset 0 0 0 1px ${P.ink_(30)}`, fontFamily: P.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' };
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', rowGap: 6, textAlign: 'center' }}>
        {cal.head.map((h, i) => (
          <div key={`h${i}`} style={{ ...labelStyle(P, 10, 0.08, 'inherit'), opacity: 0.62, paddingBottom: 6 }}>
            {h}
          </div>
        ))}
        {cal.cells.map((c, i) => (
          <div key={`c${i}`} style={{ display: 'grid', placeItems: 'center', height: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 14, background: c.on ? P.accent : 'transparent', color: c.on ? P.onacc : 'inherit', fontWeight: c.on ? 700 : 400, fontVariantNumeric: 'tabular-nums' }}>{c.n}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{`${dt.weekday}, ${dt.long} · ${d.ceremony.time}`}</div>
        {l !== null && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            <a href={l.googleUrl} target="_blank" rel="noopener noreferrer" style={btn}>
              <Icon name="EventAvailable" size={16} />
              {S.addGoogle}
            </a>
            <a href={l.icsUrl} download="harusi.ics" style={btn}>
              {S.addIcs}
            </a>
          </div>
        )}
        {links !== null && <div style={{ fontSize: 12, opacity: 0.7 }}>{S.calNote}</div>}
      </div>
    </>
  );
}

/** Lines shown before "View full programme" expands the rest. */
const PROGRAMME_PREVIEW = 4;

/** The programme with a "View full programme" expander when it is long. */
function Programme({ d, lang, view }: { d: InviteDesign; lang: Lang; view: 'line' | 'cards' | 'ticket' | 'big' }) {
  const P = usePal();
  const S = STR[lang];
  const [full, setFull] = useState(false);
  const long = d.ratiba.length > PROGRAMME_PREVIEW && view !== 'cards';
  const shown = long && !full ? { ...d, ratiba: d.ratiba.slice(0, PROGRAMME_PREVIEW) } : d;
  return (
    <div data-programme={full ? 'full' : 'preview'}>
      <Ratiba d={shown} lang={lang} view={view} />
      {long && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <button
            type="button"
            onClick={() => setFull((f) => !f)}
            aria-expanded={full}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', border: `1px solid ${P.ink_(30)}`, background: 'transparent', cursor: 'pointer', color: P.ink, fontFamily: P.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}
          >
            {full ? S.viewLess : S.viewFull}
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{ transform: full ? 'rotate(180deg)' : 'none' }}>
              <path d="M7 10l5 5 5-5z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function Ratiba({ d, lang, view }: { d: InviteDesign; lang: Lang; view: 'line' | 'cards' | 'ticket' | 'big' }) {
  const P = usePal();
  const S = STR[lang];
  const rat = d.ratiba.map((r) => ({ t: r.t, icon: r.icon, label: r[lang] || r.sw || r.en || '', place: r.place ?? '' }));
  if (view === 'cards') {
    return (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', margin: '0 -24px', padding: '4px 24px 12px' }}>
        {rat.map((r, i) => (
          <div key={i} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', padding: '18px 16px', borderRadius: 16, background: P.panel, color: P.pink, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: `inset 0 0 0 1px ${P.pink_(12)}` }}>
            <div style={{ color: P.accPn }}>
              <Icon name={r.icon} size={22} />
            </div>
            <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 300, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{r.t}</div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{r.label}</div>
            {r.place !== '' && <div style={{ fontSize: 12, color: P.pink_(70) }}>{r.place}</div>}
          </div>
        ))}
      </div>
    );
  }
  if (view === 'ticket') {
    const cols = '62px minmax(0, 1fr) 24px';
    return (
      <div style={{ borderRadius: 12, overflow: 'hidden', background: P.panel, color: P.pink, boxShadow: `inset 0 0 0 1px ${P.pink_(14)}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, padding: '10px 16px', ...monoStyle(P, 10, 0.1), textTransform: 'uppercase', background: P.pink_(7), color: P.pink_(66) }}>
          <span>{S.timeH}</span>
          <span>{S.eventH}</span>
          <span />
        </div>
        {rat.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: cols, gap: 10, alignItems: 'center', padding: '12px 16px', borderTop: `1px dashed ${P.pink_(20)}` }}>
            <span style={{ ...monoStyle(P, 15, 0), fontWeight: 700, color: P.accPn, fontVariantNumeric: 'tabular-nums' }}>{r.t}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{r.label}</span>
              {r.place !== '' && <span style={{ display: 'block', fontSize: 12, color: P.pink_(70) }}>{r.place}</span>}
            </span>
            <span style={{ color: P.accPn, display: 'flex' }}>
              <Icon name={r.icon} size={18} />
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (view === 'big') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rat.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '14px 0', borderTop: `1px solid ${P.ink_(14)}` }}>
            <div style={{ minWidth: 112, fontSize: 40, lineHeight: 1, fontWeight: P.nw, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{r.t}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{r.label}</div>
              {r.place !== '' && <div style={{ fontSize: 13, opacity: 0.7 }}>{r.place}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', left: 77, top: 20, bottom: 20, width: 1, background: 'currentColor', opacity: 0.18 }} />
      {rat.map((r, i) => (
        <div key={i} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '64px 28px minmax(0, 1fr)', alignItems: 'start', padding: '11px 0' }}>
          <div style={{ ...labelStyle(P, 13, 0, P.accBg), textTransform: 'none', textAlign: 'right', paddingTop: 2, fontVariantNumeric: 'tabular-nums' }}>{r.t}</div>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: P.accent }} />
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 'none', color: P.accBg, paddingTop: 1 }}>
              <Icon name={r.icon} size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{r.label}</div>
              {r.place !== '' && <div style={{ fontSize: 13, opacity: 0.7 }}>{r.place}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Gallery({ d, view, items }: { d: InviteDesign; view: 'grid' | 'carousel' | 'prints' | 'mosaic'; items: { ph: ReturnType<typeof photo>; crop: { x: number; y: number; z: number } }[] }) {
  const P = usePal();
  const one = items.length === 1;
  const cols = one ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))';
  const tile = (i: number, ar: string, extra: CSSProperties = {}) => (
    <div key={i} style={{ position: 'relative', aspectRatio: ar, overflow: 'hidden', background: P.acc_(20), ...extra }}>
      <Photo ph={items[i]?.ph ?? null} crop={items[i]?.crop ?? null} />
    </div>
  );
  if (view === 'carousel') {
    return (
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', margin: '0 -24px', padding: '0 24px 8px' }}>
        {items.map((_, i) => tile(i, '4 / 5', { flex: '0 0 78%', scrollSnapAlign: 'center', borderRadius: 16 }))}
      </div>
    );
  }
  if (view === 'prints') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '18px 14px', padding: 6 }}>
        {items.map((_, i) => (
          <div key={i} style={{ padding: '8px 8px 28px', background: '#FFFFFF', boxShadow: '0 10px 24px rgba(26,37,22,0.18)', transform: `rotate(${i % 2 ? '2deg' : '-2.5deg'})` }}>
            {tile(i, one ? '4 / 5' : '1 / 1')}
          </div>
        ))}
      </div>
    );
  }
  if (view === 'mosaic') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
        {items.map((_, i) => tile(i, i === 0 ? (one ? '4 / 5' : '16 / 10') : '1 / 1', i === 0 ? { gridColumn: '1 / -1' } : {}))}
      </div>
    );
  }
  return <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 8 }}>{items.map((_, i) => tile(i, one ? '4 / 5' : '1 / 1', { borderRadius: 8 }))}</div>;
}

function Faqs({ items }: { items: { question: string; answer: string }[] }) {
  const P = usePal();
  return (
    <div>
      {items.map((f, i) => (
        <details key={i} style={{ padding: '14px 0', borderTop: `1px solid ${P.ink_(14)}` }}>
          <summary style={{ fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>{f.question}</summary>
          <p style={{ fontSize: 15, margin: '8px 0 0', opacity: 0.8, whiteSpace: 'pre-wrap' }}>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

function Party({ items }: { items: { name: string; role: string; photoUrl: string | null }[] }) {
  const P = usePal();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
      {items.map((p, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
          <div style={{ position: 'relative', width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: P.ink_(12), display: 'grid', placeItems: 'center', fontSize: 24 }}>
            {p.photoUrl !== null ? <Photo ph={{ id: `w${i}`, src: p.photoUrl, w: 400, h: 400 }} crop={null} alt={p.name} /> : initials(p.name)}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>{p.role}</div>
        </div>
      ))}
    </div>
  );
}

function Note({ text }: { text: string }) {
  return <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{text}</p>;
}

/** The first moment: the couple's monogram and "Opening your invitation", while the page settles. */
function Splash(p: { P: Pal; h: number; ini: { a: string; b: string }; names: { a: string; b: string }; label: string; host: string }) {
  const { P } = p;
  return (
    <div data-invite-splash="1" className="wi-splash" aria-live="polite" style={{ position: 'absolute', left: 0, top: 0, right: 0, height: p.h, zIndex: 21, background: P.bg, color: P.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
      <div style={labelStyle(P, 10, 0.3, P.ink_(55))}>{p.host}</div>
      <div style={{ ...nameStyle(P, 30, 1.1), fontWeight: 300 }}>{`${p.names.a} & ${p.names.b}`}</div>
      <div style={{ position: 'relative', width: 64, height: 64, marginTop: 10 }}>
        <div className="wi-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${P.ink_(16)}`, borderTopColor: P.accBg }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', ...monoStyle(P, 12, 0.1, P.ink), fontWeight: 600 }}>{`${p.ini.a}${p.ini.b}`}</div>
      </div>
      <div style={{ ...labelStyle(P, 10, 0.26, P.ink_(60)), marginTop: 6 }}>{p.label}</div>
    </div>
  );
}

function Opening(p: {
  kind: string;
  anim: boolean;
  h: number;
  onOpen: () => void;
  P: Pal;
  names: { a: string; b: string };
  ini: { a: string; b: string };
  host: string;
  dots: string;
  cardNo: string;
  S: (typeof STR)['sw'];
  forName: string;
  textColor: string;
  music: boolean;
  songTitle: string;
  coverPh: ReturnType<typeof photo>;
  coverCrop: { x: number; y: number; z: number };
  vinyl: (size: number, label: number, extra?: CSSProperties) => ReactNode;
}) {
  const { P, anim, S } = p;
  const fade = anim ? 0 : 1;
  const solid = ['envelope', 'tear', 'fade', 'spin'].includes(p.kind);
  const cta = p.kind === 'tear' ? S.tapTear : p.kind === 'spin' ? S.tapPlay : S.tapOpen;
  const name = (size: number): CSSProperties => ({ ...nameStyle(P, size, 1) });
  return (
    <div
      data-invite-overlay="1"
      role="button"
      tabIndex={0}
      aria-label={cta}
      onClick={p.onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') p.onOpen();
      }}
      style={{ position: 'absolute', left: 0, top: 0, right: 0, height: p.h, zIndex: 20, overflow: 'hidden', cursor: 'pointer', perspective: 1400, pointerEvents: anim ? 'none' : 'auto' }}
    >
      {solid && <div style={{ position: 'absolute', inset: 0, background: P.bg, transition: 'opacity 650ms ease 500ms', opacity: fade }} />}

      {p.kind === 'envelope' && (
        <div style={{ position: 'absolute', left: '50%', top: '42%', width: 300, height: 200, margin: '-100px 0 0 -150px', transition: 'transform 800ms cubic-bezier(.5,0,.2,1) 420ms, opacity 600ms ease 520ms', transform: anim ? 'translateY(120%) rotate(-8deg)' : 'none', opacity: fade }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: P.panel, boxShadow: '0 26px 60px rgba(26,37,22,0.25)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 124, borderRadius: '0 0 6px 6px', background: mix(P.accent, 14, P.panel), clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 132, background: mix(P.accent, 26, P.panel), clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformOrigin: '50% 0', transition: 'transform 600ms ease', transform: anim ? 'rotateX(180deg)' : 'none' }} />
          <div style={{ position: 'absolute', left: '50%', top: 102, width: 62, height: 62, marginLeft: -31, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', background: P.accent, color: P.onacc, fontSize: 17, fontWeight: 600, letterSpacing: '0.04em', boxShadow: '0 6px 16px rgba(26,37,22,0.3)', transition: 'opacity 250ms ease', opacity: fade }}>
            {`${p.ini.a}·${p.ini.b}`}
          </div>
        </div>
      )}

      {p.kind === 'curtain' && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50.5%', background: P.accent, color: P.onacc, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 30, boxSizing: 'border-box', transition: 'transform 1050ms cubic-bezier(.7,0,.3,1)', transform: anim ? 'translateX(-102%)' : 'none', boxShadow: 'inset -18px 0 30px rgba(26,37,22,0.18)' }}>
            <div style={{ ...name(30), textAlign: 'right' }}>{p.names.a}</div>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50.5%', background: P.accent, color: P.onacc, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 30, boxSizing: 'border-box', transition: 'transform 1050ms cubic-bezier(.7,0,.3,1)', transform: anim ? 'translateX(102%)' : 'none', boxShadow: 'inset 18px 0 30px rgba(26,37,22,0.18)' }}>
            <div style={name(30)}>{p.names.b}</div>
          </div>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 46, height: 46, margin: '-23px 0 0 -23px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: P.onacc, color: P.accent, fontSize: 22, fontWeight: 300, transition: 'opacity 250ms ease', opacity: fade }}>&amp;</div>
        </>
      )}

      {p.kind === 'tear' && (
        <div style={{ position: 'absolute', left: '50%', top: '44%', width: 270, marginLeft: -135, transform: 'translateY(-50%)' }}>
          <div style={{ padding: '26px 22px', borderRadius: '16px 16px 4px 4px', background: P.panel, color: P.pink, textAlign: 'center', transition: 'transform 800ms ease 300ms, opacity 700ms ease 400ms', transform: anim ? 'translateY(-40px) scale(1.04)' : 'none', opacity: anim ? 0 : 1, boxShadow: '0 20px 50px rgba(26,37,22,0.2)' }}>
            <div style={labelStyle(P, 10, 0.24, P.accPn)}>{S.invitation}</div>
            <div style={{ ...name(30), marginTop: 12 }}>
              {p.names.a}
              <br />&amp; {p.names.b}
            </div>
            <div style={{ ...monoStyle(P, 12, 0.1), marginTop: 14 }}>{p.dots}</div>
          </div>
          <div style={{ height: 0, borderTop: `2px dashed ${P.pink_(30)}`, margin: '0 10px' }} />
          <div style={{ padding: 16, borderRadius: '4px 4px 16px 16px', background: P.accent, color: P.onacc, textAlign: 'center', ...monoStyle(P, 11, 0.16), textTransform: 'uppercase', transformOrigin: '10% 0', transition: 'transform 700ms cubic-bezier(.5,0,.6,1), opacity 600ms ease 150ms', transform: anim ? 'translateY(80px) rotate(14deg)' : 'none', opacity: fade }}>{`${S.card} ${p.cardNo}`}</div>
        </div>
      )}

      {p.kind === 'photo' && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: P.accent, overflow: 'hidden', transition: 'transform 1150ms ease, opacity 900ms ease 250ms', transform: anim ? 'scale(1.14)' : 'scale(1)', opacity: fade }}>
            <Photo ph={p.coverPh} crop={p.coverCrop} eager />
          </div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,37,22,0.35) 0%, transparent 30%, transparent 45%, rgba(26,37,22,0.85) 100%)', transition: 'opacity 700ms ease 300ms', opacity: fade }} />
          <div style={{ position: 'absolute', left: 24, right: 24, bottom: 150, color: '#FFFFFF', textAlign: 'center', transition: 'opacity 400ms ease', opacity: fade }}>
            <div style={labelStyle(P, 11, 0.24, '#E8D9B8')}>{p.host}</div>
            <div style={{ ...name(42), lineHeight: 1.02, marginTop: 12 }}>
              {p.names.a} <span style={{ fontWeight: 200 }}>&amp;</span> {p.names.b}
            </div>
          </div>
        </>
      )}

      {p.kind === 'spin' && (
        <>
          <div style={{ position: 'absolute', left: '50%', top: '40%', width: 250, height: 250, margin: '-125px 0 0 -125px', transition: 'transform 900ms ease 250ms, opacity 700ms ease 400ms', transform: anim ? 'scale(1.14)' : 'scale(1)', opacity: fade }}>
            {p.vinyl(250, 100, { boxShadow: '0 24px 60px rgba(26,37,22,0.4)' })}
          </div>
          <div style={{ position: 'absolute', left: 24, right: 24, top: 'calc(40% + 150px)', textAlign: 'center', transition: 'opacity 400ms ease', opacity: fade }}>
            <div style={labelStyle(P, 11, 0.22, P.accBg)}>{S.ourSong}</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>{`“${p.songTitle}”`}</div>
          </div>
        </>
      )}

      {p.kind === 'fade' && (
        <div style={{ position: 'absolute', left: 24, right: 24, top: '40%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 1000ms ease, opacity 800ms ease 200ms', transform: anim ? 'scale(1.14)' : 'scale(1)', opacity: fade }}>
            <div style={labelStyle(P, 11, 0.24, P.accBg)}>{p.host}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, fontSize: 110, lineHeight: 0.9, fontWeight: P.nw, letterSpacing: '-0.04em' }}>
              <span>{p.ini.a}</span>
              <span style={{ width: 2, height: 96, background: P.accent, transform: 'rotate(20deg)' }} />
              <span>{p.ini.b}</span>
            </div>
            <div style={{ ...name(20), marginTop: 22 }}>{`${p.names.a} & ${p.names.b}`}</div>
            <div style={{ ...monoStyle(P, 12, 0.14, P.ink_(70)), marginTop: 8 }}>{p.dots}</div>
          </div>
        </div>
      )}

      {p.kind === 'unfold' && (
        <>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50.5%', transformOrigin: '0 50%', transition: 'transform 1100ms cubic-bezier(.6,0,.3,1), opacity 700ms ease 450ms', transform: anim ? 'rotateY(-100deg)' : 'none', opacity: fade, background: `radial-gradient(circle, ${P.accent} 0 3px, transparent 4px) 0 0 / 16px 16px, ${P.ink}`, boxShadow: `inset -2px 0 0 ${P.accent}` }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50.5%', transformOrigin: '100% 50%', transition: 'transform 1100ms cubic-bezier(.6,0,.3,1), opacity 700ms ease 450ms', transform: anim ? 'rotateY(100deg)' : 'none', opacity: fade, background: `radial-gradient(circle, ${P.accent} 0 3px, transparent 4px) 0 0 / 16px 16px, ${P.ink}` }} />
          <div style={{ position: 'absolute', left: '50%', top: '42%', width: 180, height: 180, margin: '-90px 0 0 -90px', borderRadius: '50%', border: `7px dotted ${P.accent}`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', background: P.bg, transition: 'transform 500ms ease, opacity 400ms ease', transform: anim ? 'scale(1.14)' : 'scale(1)', opacity: fade }}>
            <div style={{ display: 'flex', whiteSpace: 'nowrap', fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em' }}>{`${p.ini.a}${p.ini.b}`}</div>
          </div>
        </>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '0 24px', transition: 'opacity 300ms ease', opacity: fade, color: p.textColor }}>
        <div style={{ ...monoStyle(P, 11, 0.16), textTransform: 'uppercase', opacity: 0.85 }}>{p.forName}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: '1px solid currentColor', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{cta}</div>
        {p.music && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.8 }}>
            <Icon name="VolumeUp" size={14} />
            {S.withMusic}
          </div>
        )}
      </div>
    </div>
  );
}
