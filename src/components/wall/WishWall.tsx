'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SPOTLIGHT_MS,
  WALL_POLL_MS,
  clampIndex,
  columnSeconds,
  coupleLabel,
  fetchWall,
  freshIds,
  hashtagLabel,
  shortUrl,
  splitColumns,
  splitWall,
  wallDate,
  wordsSize,
  type WallLang,
  type WishWallItem,
  type WishWallResponse,
} from '@/lib/wall';
import s from './wall.module.css';

const COPY = {
  sw: {
    eyebrow: 'Ukuta wa salamu',
    sub: 'Wall of wishes',
    count: (n: number) => (n === 1 ? '1 salamu' : `${n} salamu`),
    scan: 'Scan ili kuacha salamu na picha yako',
    scanSub: 'Scan to leave your wish and photo',
    emptyTitle: 'Salamu ya kwanza bado haijafika',
    emptyBody: 'Scan QR, waandikie maharusi maneno machache na uongeze picha yako. Itaonekana hapa mara moja.',
    spotEmpty: 'Picha ya kwanza itaonekana hapa. Piga selfie ukiacha salamu zako.',
    stale: 'Inajaribu kuunganisha…',
    photoAlt: (name: string) => `Picha kutoka kwa ${name}`,
  },
  en: {
    eyebrow: 'Wall of wishes',
    sub: 'Ukuta wa salamu',
    count: (n: number) => (n === 1 ? '1 wish' : `${n} wishes`),
    scan: 'Scan to leave your wish and photo',
    scanSub: 'Scan ili kuacha salamu na picha yako',
    emptyTitle: 'The first wish is on its way',
    emptyBody: 'Scan the QR, write the couple a few words and add your photo. It appears here at once.',
    spotEmpty: 'The first photo shows here. Take a selfie when you leave your wish.',
    stale: 'Reconnecting…',
    photoAlt: (name: string) => `Photo from ${name}`,
  },
} as const;

/** The site header and footer have no place on the screen (same trick as the invitation page). */
const HIDE_SITE_CHROME = 'body:has([data-wish-wall]) > header, body:has([data-wish-wall]) > footer { display: none; }';

/** How long the old spotlight photo stays under the new one, in ms. */
const CROSSFADE_MS = 1600;
/** The cursor goes after this long without moving, in ms. */
const IDLE_MS = 3000;

export interface WallQr {
  /** Inline SVG markup from lib/qr.ts. */
  svg: string;
  /** The URL that SVG encodes, so a changed wishesUrl can be re-encoded. */
  url: string;
}

function firstPhoto(item: WishWallItem): { url: string; caption?: string } | null {
  const p = item.photos.find((x) => typeof x.url === 'string' && x.url !== '');
  return p === undefined ? null : { url: p.url, caption: p.caption };
}

/**
 * The live wall for the reception screen. It arrives with the first payload
 * from the server shell, then asks GET /story/:slug/wall every 8 seconds and
 * keeps the last good answer on screen when a poll fails.
 */
export function WishWall({
  slug,
  lang,
  initial,
  qr,
}: {
  slug: string;
  lang: WallLang;
  initial: WishWallResponse | null;
  qr: WallQr | null;
}) {
  const t = COPY[lang];
  const [data, setData] = useState<WishWallResponse | null>(initial);
  const [stale, setStale] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set((initial?.items ?? []).map((i) => i.id)));
  const [spotIndex, setSpotIndex] = useState(0);
  const [idle, setIdle] = useState(false);
  const [qrSvg, setQrSvg] = useState<WallQr | null>(qr);
  const itemsRef = useRef<WishWallItem[]>(initial?.items ?? []);

  const { spotlight, all } = useMemo(() => splitWall(data?.items ?? []), [data]);
  const spotlightLen = spotlight.length;

  /* Poll */
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const next = await fetchWall(slug);
        if (!alive) return;
        const arrived = freshIds(itemsRef.current, next.items);
        itemsRef.current = next.items;
        setData(next);
        setStale(false);
        if (arrived.size > 0) setFresh(arrived);
      } catch {
        if (alive) setStale(true);
      }
    }
    const id = window.setInterval(() => void tick(), WALL_POLL_MS);
    if (initial === null) void tick();
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [slug, initial]);

  /* Spotlight rotation */
  useEffect(() => {
    if (spotlightLen <= 1) return undefined;
    const id = window.setInterval(() => setSpotIndex((i) => i + 1), SPOTLIGHT_MS);
    return () => window.clearInterval(id);
  }, [spotlightLen]);


  /* Cursor hides after 3 s idle */
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    function wake() {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    }
    window.addEventListener('mousemove', wake);
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  /* Re-encode the QR if the API's wishesUrl is not the one the server drew */
  const wishesUrl = data?.wishesUrl ?? qr?.url ?? '';
  useEffect(() => {
    if (wishesUrl === '' || (qrSvg !== null && qrSvg.url === wishesUrl)) return;
    let alive = true;
    void import('qrcode')
      .then((mod) => mod.toString(wishesUrl, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#1F2A1A', light: '#0000' } }))
      .then((svg) => {
        if (alive) setQrSvg({ svg, url: wishesUrl });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [wishesUrl, qrSvg]);

  /* Spotlight: current and the one before it, for the crossfade */
  const current = spotlightLen > 0 ? spotlight[clampIndex(spotIndex, spotlightLen)] : null;
  const [prev, setPrev] = useState<WishWallItem | null>(null);
  const lastCurrentRef = useRef<WishWallItem | null>(current);
  useEffect(() => {
    const was = lastCurrentRef.current;
    lastCurrentRef.current = current;
    if (was === null || current === null || was.id === current.id) return undefined;
    setPrev(was);
    const id = window.setTimeout(() => setPrev(null), CROSSFADE_MS);
    return () => window.clearTimeout(id);
  }, [current]);

  /* The two scrolling columns: every wish, dealt left and right, newest at the top. */
  const columns = useMemo(() => splitColumns(all), [all]);

  const couple = coupleLabel(data?.couple ?? null, lang);
  const date = wallDate(data?.couple?.weddingDate, lang);
  const tag = hashtagLabel(data?.hashtag ?? null);
  const total = data?.total ?? 0;
  const empty = data !== null && all.length === 0;

  const spotParity = clampIndex(spotIndex, Math.max(1, spotlightLen)) % 2 === 0;

  return (
    <div className={`${s.root}${idle ? ` ${s.idle}` : ''}`} data-wish-wall="1" data-lang={lang}>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      <div className={s.bg} aria-hidden>
        <div className={`${s.blob} ${s.blob1}`} />
        <div className={`${s.blob} ${s.blob2}`} />
        <div className={`${s.blob} ${s.blob3}`} />
      </div>

      <header className={s.top}>
        <div>
          <h1 className={s.names}>{couple}</h1>
          <p className={s.meta}>
            {date !== '' && <span>{date}</span>}
            {tag !== '' && <span>{tag}</span>}
          </p>
        </div>
        <div className={s.right}>
          <p className={s.eyebrow}>{t.eyebrow}</p>
          <p className={s.eyebrowSub}>{t.sub}</p>
          <p className={s.count} aria-live="polite" data-wall-count={total}>
            <span className={`${s.dot}${stale ? ` ${s.stale}` : ''}`} title={stale ? t.stale : undefined} />
            {t.count(total)}
          </p>
        </div>
      </header>

      <main className={s.stage}>
        {empty ? (
          <div className={s.empty}>
            <div className={s.emptyInner}>
              <h2 className={s.emptyTitle}>{t.emptyTitle}</h2>
              <p className={s.emptyBody}>{t.emptyBody}</p>
            </div>
          </div>
        ) : (
          <section className={s.spot} data-wall-spotlight={current?.id ?? ''}>
            <div className={s.spotPhoto}>
              {prev !== null && current !== null && prev.id !== current.id && firstPhoto(prev) !== null && (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={prev.id} src={firstPhoto(prev)?.url} alt="" className={`${s.spotImg} ${s.under} ${spotParity ? s.kbB : s.kbA}`} />
              )}
              {current !== null && firstPhoto(current) !== null ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={current.id} src={firstPhoto(current)?.url} alt={t.photoAlt(current.name)} className={`${s.spotImg} ${s.over} ${spotParity ? s.kbA : s.kbB}`} />
              ) : current !== null ? (
                <figure key={current.id} className={s.spotWords} data-wall-words={wordsSize(current.message)}>
                  <span className={s.spotQuote} aria-hidden>&ldquo;</span>
                  <blockquote className={`${s.spotWordsMsg} ${s[`words_${wordsSize(current.message)}`]}`}>{current.message}</blockquote>
                  <figcaption className={s.spotWordsName}>{current.name}</figcaption>
                </figure>
              ) : (
                <div className={s.spotEmpty}>{t.spotEmpty}</div>
              )}
              {current !== null && firstPhoto(current)?.caption !== undefined && firstPhoto(current)?.caption !== '' && (
                <div className={s.spotCaption}>{firstPhoto(current)?.caption}</div>
              )}
            </div>
            {current !== null && firstPhoto(current) !== null && (
              <div className={s.spotText} key={current.id}>
                <p className={s.spotName}>{current.name}</p>
                <p className={s.spotMsg}>{current.message}</p>
              </div>
            )}
          </section>
        )}

        <aside className={s.side}>
          {!empty && (
            <div className={s.cols} data-wall-columns={columns.filter((c) => c.length > 0).length}>
              {columns.map((col, c) =>
                col.length === 0 ? null : (
                  <div key={c} className={s.col}>
                    <div
                      className={`${s.track} ${c === 0 ? s.trackA : s.trackB}`}
                      style={{ animationDuration: `${columnSeconds(col.length)}s` }}
                      data-wall-track={col.length}
                    >
                      {[0, 1].map((copy) => (
                        <div key={copy} className={`${s.list}${copy === 1 ? ` ${s.dup}` : ''}`} aria-hidden={copy === 1}>
                          {col.map((item, i) => {
                            const photo = firstPhoto(item);
                            const isFresh = copy === 0 && fresh.has(item.id);
                            const cls = isFresh ? ` ${s.fresh}` : '';
                            const delay = isFresh ? { animationDelay: `${Math.min(i, 11) * 90}ms` } : undefined;
                            if (photo !== null) {
                              return (
                                <article key={item.id} className={`${s.card} ${s.cardPhoto}${cls}`} style={delay} data-wall-card={copy === 0 ? item.id : undefined}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo.url} alt={copy === 0 ? t.photoAlt(item.name) : ''} loading="lazy" />
                                  <div className={s.cardBody}>
                                    <p className={s.cardMsg}>{item.message}</p>
                                    <p className={s.cardName}>{item.name}</p>
                                  </div>
                                </article>
                              );
                            }
                            return (
                              <article key={item.id} className={`${s.card} ${s.cardText} ${i % 2 === 1 ? s.paper : s.linen}${cls}`} style={delay} data-wall-card={copy === 0 ? item.id : undefined}>
                                <div className={s.quote} aria-hidden>
                                  &ldquo;
                                </div>
                                <p className={s.cardMsg}>{item.message}</p>
                                <p className={s.cardName}>{item.name}</p>
                              </article>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          <div className={s.qrPanel} data-wall-qr="1">
            {qrSvg !== null && <div className={s.qrBox} dangerouslySetInnerHTML={{ __html: qrSvg.svg }} />}
            <div className={s.qrText}>
              <p className={s.qrLead}>{t.scan}</p>
              <p className={s.qrLeadSub}>{t.scanSub}</p>
              {wishesUrl !== '' && <p className={s.qrUrl}>{shortUrl(wishesUrl)}</p>}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
