'use client';

import { useEffect, useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import {
  MAX_WISH_PHOTOS,
  WISH_CAPTION_MAX,
  forgetSentWish,
  rememberSentWish,
  uploadWishPhoto,
  type GuestbookPhoto,
  type PhotoUploadFailure,
  type SentWish,
} from '@/lib/wish-photos';

export type WishPhotosLang = 'sw' | 'en';

/**
 * The colours and faces the step is drawn in, so the one component sits in
 * the sage wishes page and inside an invitation drawn in the couple's own
 * palette.
 */
export interface WishPhotosTheme {
  /** Text colour on the panel. */
  ink: string;
  /** Quieter text (lead, counters). */
  muted: string;
  /** Hairlines and the dashed drop zone. */
  line: string;
  /** Filled button. */
  accent: string;
  onAccent: string;
  /** Behind thumbnails and the preview. */
  well: string;
  /** Error text. */
  danger: string;
  sans: string;
  mono: string;
}

/** The sage theme, for the /<slug>/wishes page and the story page. */
export const SAGE_THEME: WishPhotosTheme = {
  ink: '#1F2A1A',
  muted: '#4A5840',
  line: '#E0DCC8',
  accent: '#4F6A42',
  onAccent: '#FFFFFF',
  well: '#F1EADB',
  danger: '#B02020',
  sans: 'var(--font-manrope), Manrope, system-ui, sans-serif',
  mono: 'var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace',
};

const COPY = {
  sw: {
    heading: 'Ongeza picha',
    lead: 'Picha yako itaonekana kwenye ukuta wa salamu leo, pamoja na maneno yako.',
    selfie: 'Piga selfie',
    choose: 'Chagua picha',
    caption: 'Maelezo mafupi (hiari)',
    captionPh: 'Mfano: Kutoka kwa familia ya Mushi',
    left: (n: number) => `Herufi ${n} zimebaki`,
    upload: 'Pakia picha',
    uploading: 'Inapakia…',
    cancel: 'Ghairi',
    retry: 'Jaribu tena',
    another: (n: number) => (n === 1 ? 'Unaweza kuongeza picha moja zaidi' : `Unaweza kuongeza picha ${n} zaidi`),
    full: `Umefikisha picha ${MAX_WISH_PHOTOS}, kiwango cha juu kwa salamu moja. Asante!`,
    added: 'Picha imefika!',
    done: 'Nimemaliza',
    seeWall: 'Ona ukuta wa salamu',
    yourPhotos: 'Picha zako',
    err: {
      token: 'Salamu hii haiwezi kubadilishwa tena kutoka hapa.',
      full: `Salamu hii tayari ina picha ${MAX_WISH_PHOTOS}.`,
      bad_photo: 'Picha hiyo ni kubwa mno au si picha (JPG, PNG au WEBP). Jaribu nyingine.',
      gone: 'Salamu hii haipatikani tena.',
      network: 'Mtandao umekatika. Jaribu tena.',
      other: 'Imeshindikana kupakia. Jaribu tena.',
    } satisfies Record<PhotoUploadFailure, string>,
  },
  en: {
    heading: 'Add a photo',
    lead: 'Your photo goes up on the wall of wishes today, next to your words.',
    selfie: 'Take a selfie',
    choose: 'Choose a photo',
    caption: 'A short caption (optional)',
    captionPh: 'e.g. From the Mushi family',
    left: (n: number) => `${n} characters left`,
    upload: 'Upload photo',
    uploading: 'Uploading…',
    cancel: 'Cancel',
    retry: 'Try again',
    another: (n: number) => (n === 1 ? 'You can add one more photo' : `You can add ${n} more photos`),
    full: `That is ${MAX_WISH_PHOTOS} photos, the most for one wish. Thank you!`,
    added: 'Photo added!',
    done: 'Done',
    seeWall: 'See the wall',
    yourPhotos: 'Your photos',
    err: {
      token: 'This wish can no longer be changed from here.',
      full: `This wish already has ${MAX_WISH_PHOTOS} photos.`,
      bad_photo: 'That photo is too large or not an image (JPG, PNG or WEBP). Try another.',
      gone: 'This wish is no longer available.',
      network: 'The connection dropped. Try again.',
      other: 'Could not upload. Try again.',
    } satisfies Record<PhotoUploadFailure, string>,
  },
} as const;

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m5 17 4.5-5 3.5 4 2.5-3 3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="15.5" cy="9.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

/**
 * The step after a wish is sent: a selfie or a gallery photo, an optional
 * caption, up to three photos on the one wish. Uploads go through
 * lib/wish-photos.ts; the edit token stays in state and sessionStorage.
 */
export function WishPhotos({
  slug,
  wish,
  lang,
  theme,
  onDone,
  wallHref,
}: {
  slug: string;
  wish: SentWish;
  lang: WishPhotosLang;
  theme: WishPhotosTheme;
  /** "Nimemaliza / Done", with the photos now on the wish: the parent shows its own thank-you. */
  onDone: (photos: GuestbookPhoto[]) => void;
  /** Defaults to /<slug>/wall. */
  wallHref?: string;
}) {
  const t = COPY[lang];
  const T = theme;
  const [photos, setPhotos] = useState<GuestbookPhoto[]>(wish.photos);
  const [pending, setPending] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PhotoUploadFailure | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  /** Set after 403 or 409: no more uploads from here. */
  const [locked, setLocked] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    rememberSentWish(slug, { entryId: wish.entryId, editToken: wish.editToken, photos });
  }, [slug, wish.entryId, wish.editToken, photos]);

  useEffect(() => {
    if (pending === null || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(pending);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  const remaining = Math.max(0, MAX_WISH_PHOTOS - photos.length);
  const full = remaining === 0;

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    // Let the same file be chosen twice in a row.
    e.target.value = '';
    if (file === null) return;
    setError(null);
    setJustAdded(false);
    setPending(file);
  }

  function cancel() {
    setPending(null);
    setCaption('');
    setError(null);
  }

  async function upload() {
    if (pending === null || busy) return;
    setBusy(true);
    setError(null);
    const res = await uploadWishPhoto({ slug, entryId: wish.entryId, editToken: wish.editToken, file: pending, caption });
    setBusy(false);
    if (res.ok) {
      setPhotos(res.photos);
      setPending(null);
      setCaption('');
      setJustAdded(true);
      return;
    }
    setError(res.reason);
    if (res.reason === 'token' || res.reason === 'full' || res.reason === 'gone') {
      setLocked(true);
      setPending(null);
    }
  }

  function done() {
    forgetSentWish(slug, wish.entryId);
    onDone(photos);
  }

  const pickers = !full && !locked && pending === null;

  const ghostBtn: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '13px 14px',
    border: `1px solid ${T.line}`,
    background: 'transparent',
    color: T.ink,
    fontFamily: T.sans,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
  const solidBtn: CSSProperties = {
    ...ghostBtn,
    border: 0,
    background: T.accent,
    color: T.onAccent,
  };
  const linkBtn: CSSProperties = {
    background: 'transparent',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    color: T.ink,
    fontFamily: T.sans,
    fontSize: 13,
    textDecoration: 'underline',
    textUnderlineOffset: 4,
  };

  return (
    <div data-wish-photos="1" style={{ display: 'flex', flexDirection: 'column', gap: 14, color: T.ink, fontFamily: T.sans, textAlign: 'left' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: '-0.01em' }}>{t.heading}</div>
        <div style={{ marginTop: 4, fontSize: 14, color: T.muted }}>{t.lead}</div>
      </div>

      {photos.length > 0 && (
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>{t.yourPhotos}</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 8 }}>
            {photos.map((p) => (
              <li key={p.id} style={{ width: 84, height: 84, overflow: 'hidden', borderRadius: 10, background: T.well, flex: '0 0 auto' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {justAdded && !full && error === null && (
        <p role="status" style={{ margin: 0, fontSize: 14, color: T.accent, fontWeight: 600 }}>
          {t.added} {t.another(remaining)}
        </p>
      )}
      {full && (
        <p role="status" style={{ margin: 0, fontSize: 14, color: T.muted }}>
          {t.full}
        </p>
      )}

      {error !== null && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: T.danger }}>
          {t.err[error]}
        </p>
      )}

      {pickers && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input ref={selfieRef} type="file" accept="image/*" capture="user" onChange={pick} style={{ display: 'none' }} data-wish-selfie="1" />
          <input ref={galleryRef} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} data-wish-gallery="1" />
          <button type="button" style={ghostBtn} onClick={() => selfieRef.current?.click()}>
            <CameraIcon />
            {t.selfie}
          </button>
          <button type="button" style={ghostBtn} onClick={() => galleryRef.current?.click()}>
            <GalleryIcon />
            {t.choose}
          </button>
        </div>
      )}

      {pending !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 12, background: T.well }}>
            {previewUrl !== null && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </div>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', marginBottom: 4, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.muted }}>{t.caption}</span>
            <input
              value={caption}
              maxLength={WISH_CAPTION_MAX}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t.captionPh}
              disabled={busy}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 0', border: 0, borderBottom: `1px solid ${T.line}`, background: 'transparent', color: T.ink, fontFamily: T.sans, fontSize: 16, outline: 'none' }}
            />
            <span style={{ display: 'block', marginTop: 4, textAlign: 'right', fontFamily: T.mono, fontSize: 10, color: T.muted }}>{t.left(WISH_CAPTION_MAX - caption.length)}</span>
          </label>
          <button type="button" style={{ ...solidBtn, opacity: busy ? 0.6 : 1 }} onClick={() => void upload()} disabled={busy} data-wish-upload="1">
            {busy ? t.uploading : error !== null ? t.retry : t.upload}
          </button>
          {!busy && (
            <button type="button" style={{ ...linkBtn, alignSelf: 'center', color: T.muted }} onClick={cancel}>
              {t.cancel}
            </button>
          )}
        </div>
      )}

      {pending === null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <button type="button" style={photos.length > 0 || locked ? solidBtn : ghostBtn} onClick={done} data-wish-done="1">
            {t.done}
          </button>
          <a href={wallHref ?? `/${slug}/wall`} style={linkBtn} target="_blank" rel="noreferrer">
            {t.seeWall}
          </a>
        </div>
      )}
    </div>
  );
}
