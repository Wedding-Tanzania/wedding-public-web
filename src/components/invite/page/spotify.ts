'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Spotify's embedded player, driven from the page through Spotify's iFrame
 * API, so a couple who pasted a song link (and uploaded nothing) still gets
 * music the moment a guest opens the invitation, and a pause button that
 * works. The API replaces the element we give it with Spotify's own iframe;
 * play() must run inside a guest's tap (the open tap), the browser refuses it
 * otherwise. Without a Spotify account the player gives a 30-second preview,
 * which is Spotify's rule, not ours.
 *
 * When the script fails to arrive (blocked, offline) `failed` goes true and
 * the caller renders the plain iframe instead, as before.
 */
const SCRIPT = 'https://open.spotify.com/embed/iframe-api/v1';
const SCRIPT_WAIT_MS = 8000;

interface Controller {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  addListener: (event: string, cb: (e: { data?: { isPaused?: boolean } }) => void) => void;
}
interface IFrameApi {
  createController: (el: HTMLElement, opts: { uri: string; width: string | number; height: number }, cb: (c: Controller) => void) => void;
}
type SpotifyWindow = Window & { onSpotifyIframeApiReady?: (api: IFrameApi) => void; __wiSpotifyApi?: IFrameApi };

/** The spotify:type:id form of an open.spotify.com link, else null. */
export function spotifyUri(link: string): string | null {
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  if (u.hostname.replace(/^www\./, '') !== 'open.spotify.com') return null;
  const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m === null ? null : `spotify:${m[1]}:${m[2]}`;
}

function loadApi(): Promise<IFrameApi> {
  const w = window as SpotifyWindow;
  if (w.__wiSpotifyApi !== undefined) return Promise.resolve(w.__wiSpotifyApi);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('spotify iframe api timed out')), SCRIPT_WAIT_MS);
    const prev = w.onSpotifyIframeApiReady;
    w.onSpotifyIframeApiReady = (api) => {
      clearTimeout(timer);
      w.__wiSpotifyApi = api;
      prev?.(api);
      resolve(api);
    };
    if (document.querySelector(`script[src="${SCRIPT}"]`) === null) {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.onerror = () => {
        clearTimeout(timer);
        reject(new Error('spotify iframe api failed to load'));
      };
      document.head.appendChild(s);
    }
  });
}

export function useSpotifyPlayer(uri: string | null, enabled: boolean) {
  const host = useRef<HTMLDivElement>(null);
  const ctrl = useRef<Controller | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!enabled || uri === null) return;
    let gone = false;
    loadApi().then(
      (api) => {
        const el = host.current;
        if (gone || el === null) return;
        // The API swaps our element for its iframe; give it a child to replace
        // so the host (and its ref) survive a re-render.
        const slot = document.createElement('div');
        el.replaceChildren(slot);
        api.createController(slot, { uri, width: '100%', height: 152 }, (c) => {
          if (gone) return;
          ctrl.current = c;
          c.addListener('ready', () => setReady(true));
          c.addListener('playback_update', (e) => setPlaying(e.data?.isPaused === false));
        });
      },
      () => {
        if (!gone) setFailed(true);
      },
    );
    return () => {
      gone = true;
    };
  }, [uri, enabled]);

  const play = useCallback(() => ctrl.current?.play(), []);
  const pause = useCallback(() => ctrl.current?.pause(), []);
  const toggle = useCallback(() => ctrl.current?.togglePlay(), []);
  return { host, ready, failed, playing, play, pause, toggle };
}
