/**
 * Music for the invitation.
 *
 * Background audio is the couple's uploaded song (design.music.file), played
 * through a plain <audio> element. Streaming links (Spotify, YouTube, Apple
 * Music) cannot be background audio: Spotify only plays inside its own
 * embedded player, needs the listener to press play, and offers no way to
 * start, stop or loop it from the page; YouTube and Apple Music are the same.
 * So a link is shown as "Listen to the full song", and a Spotify link also
 * gets Spotify's embedded player in the song section.
 */

export type StreamKind = 'spotify' | 'youtube' | 'apple';

export function streamKind(link: string): StreamKind | null {
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  const h = u.hostname.replace(/^www\./, '');
  if (h === 'open.spotify.com' || h === 'spotify.link') return 'spotify';
  if (h === 'youtube.com' || h === 'm.youtube.com' || h === 'music.youtube.com' || h === 'youtu.be') return 'youtube';
  if (h === 'music.apple.com') return 'apple';
  return null;
}

/** Spotify's embed URL for a track, album, playlist or episode link, else null. */
export function spotifyEmbed(link: string): string | null {
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  if (u.hostname.replace(/^www\./, '') !== 'open.spotify.com') return null;
  const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (m === null) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
}

/**
 * The design's gentle music-box loop (C, Am, F, G), synthesised with Web
 * Audio, for a couple who switched on the demo melody and uploaded nothing.
 */
export function createDemoMelody() {
  type AC = typeof AudioContext;
  let ctx: AudioContext | null = null;
  let out: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let step = 0;
  let next = 0;
  let on = false;
  const prog = [
    [60, 64, 67, 72],
    [57, 60, 64, 69],
    [53, 57, 60, 65],
    [55, 59, 62, 67],
  ];
  const pat = [0, 1, 2, 3, 2, 1, 2, 1];
  const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  const note = (t: number, m: number, dur: number, vol: number, type: OscillatorType) => {
    if (ctx === null || out === null) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = hz(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + dur + 0.05);
  };
  const tick = () => {
    if (ctx === null) return;
    const spb = 60 / 72 / 2;
    while (next < ctx.currentTime + 0.3) {
      const ch = prog[Math.floor(step / 8) % 4] as number[];
      const i = step % 8;
      const root = ch[pat[i] as number] as number;
      note(next, root + 12, 1.4, 0.08, 'sine');
      note(next, root + 24, 0.4, 0.018, 'triangle');
      if (i === 0) {
        note(next, (ch[0] as number) - 12, 3.4, 0.06, 'sine');
        note(next, ch[2] as number, 3.2, 0.025, 'sine');
      }
      next += spb;
      step++;
    }
  };
  return {
    start(): boolean {
      const w = window as unknown as { AudioContext?: AC; webkitAudioContext?: AC };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (Ctor === undefined) return false;
      if (ctx === null) {
        ctx = new Ctor();
        out = ctx.createGain();
        out.gain.value = 0.8;
        const dl = ctx.createDelay();
        const fb = ctx.createGain();
        dl.delayTime.value = 0.34;
        fb.gain.value = 0.26;
        out.connect(ctx.destination);
        out.connect(dl);
        dl.connect(fb);
        fb.connect(dl);
        dl.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') void ctx.resume();
      if (on) return true;
      on = true;
      next = ctx.currentTime + 0.06;
      tick();
      timer = setInterval(tick, 80);
      return true;
    },
    stop() {
      on = false;
      if (timer !== null) clearInterval(timer);
      timer = null;
    },
  };
}
