/**
 * Wedding.co.tz digital cards: templates, wording, page recipes and the
 * helpers both the card and the web invitation use.
 *
 * Ported from the Claude Design project "Wedding platform digital cards"
 * (lib/wcz.js). The design used CSS color-mix() everywhere; the card image
 * renderer (next/og) cannot read it, so colours are mixed here in JS with
 * `mix()` and every view gets plain hex values.
 */

export type Lang = 'sw' | 'en';
export type Faith = 'church' | 'nikah' | 'civil';

export interface Palette {
  bg: string;
  ink: string;
  accent: string;
  panel: string;
}

export type SlotKey = 'cover' | 'second' | 'third';
export interface Slot {
  key: SlotKey;
  w: number;
  h: number;
  shape: 'arch' | 'full' | 'rect' | 'circle' | 'pill' | 'fade' | 'window';
}

export type PassStyle = 'card' | 'line' | 'glass' | 'stack' | 'ticket';

export interface Template {
  id: string;
  no: string;
  name: string;
  en: string;
  kind: 'type' | 'photo';
  mode: 'light' | 'dark';
  pass: PassStyle;
  pal: Palette;
  type: { nw: number; upper: boolean };
  slots: Slot[];
  /** Name-size fitting: st = stacked names [max width, max size], ol = one line. */
  fit: { st?: [number, number]; ol?: [number, number]; pad?: number };
  /** Ticket text sits on the panel, not the background. */
  inkOn?: 'panel';
}

const T = (
  id: string,
  name: string,
  en: string,
  kind: Template['kind'],
  mode: Template['mode'],
  pass: PassStyle,
  pal: Palette,
  type: Template['type'],
  slots: Slot[],
  fit: Template['fit'],
): Template => ({ id, no: '', name, en, kind, mode, pass, pal, type, slots, fit });

export const TEMPLATES: Template[] = [
  T('t01', 'Kitani', 'Linen', 'type', 'light', 'card', { bg: '#F1EADB', ink: '#1F2A1A', accent: '#4F6A42', panel: '#FFFFFF' }, { nw: 300, upper: false }, [], { st: [900, 150] }),
  T('t02', 'Msitu', 'Forest', 'type', 'dark', 'card', { bg: '#1A2516', ink: '#E8D9B8', accent: '#A88D4A', panel: '#F5EFE3' }, { nw: 300, upper: true }, [], { st: [800, 116] }),
  T('t03', 'Upinde', 'Arch', 'photo', 'light', 'line', { bg: '#F5EFE3', ink: '#2A3A24', accent: '#A88D4A', panel: '#FFFFFF' }, { nw: 300, upper: false }, [{ key: 'cover', w: 600, h: 560, shape: 'arch' }], { ol: [900, 96] }),
  T('t04', 'Pazia', 'Veil', 'photo', 'dark', 'glass', { bg: '#1A2516', ink: '#FFFFFF', accent: '#E8D9B8', panel: '#FFFFFF' }, { nw: 700, upper: false }, [{ key: 'cover', w: 1080, h: 1350, shape: 'full' }], { st: [900, 140] }),
  T('t05', 'Nusu', 'Half', 'photo', 'light', 'stack', { bg: '#FFFFFF', ink: '#1F2A1A', accent: '#4F6A42', panel: '#F2F5EE' }, { nw: 200, upper: false }, [{ key: 'cover', w: 540, h: 1350, shape: 'rect' }], { st: [400, 104] }),
  T('t06', 'Herufi', 'Monogram', 'type', 'light', 'line', { bg: '#F1EADB', ink: '#3A4F32', accent: '#B57850', panel: '#FFFFFF' }, { nw: 200, upper: false }, [], { ol: [900, 64] }),
  T('t07', 'Tarehe', 'Date', 'type', 'light', 'card', { bg: '#E2E9DA', ink: '#2A3A24', accent: '#B57850', panel: '#FFFFFF' }, { nw: 600, upper: false }, [], { ol: [900, 80] }),
  T('t08', 'Kalenda', 'Calendar', 'type', 'dark', 'card', { bg: '#2A3A24', ink: '#F1EADB', accent: '#E8D9B8', panel: '#F5EFE3' }, { nw: 300, upper: false }, [], { ol: [900, 84] }),
  T('t09', 'Duara', 'Circle', 'photo', 'light', 'line', { bg: '#F5EFE3', ink: '#1A2516', accent: '#6F8A5E', panel: '#FFFFFF' }, { nw: 300, upper: false }, [{ key: 'cover', w: 540, h: 540, shape: 'circle' }], { ol: [900, 92] }),
  T('t10', 'Wawili', 'The two of us', 'photo', 'light', 'card', { bg: '#FFFFFF', ink: '#2A3A24', accent: '#6F8A5E', panel: '#F2F5EE' }, { nw: 300, upper: false }, [{ key: 'cover', w: 360, h: 560, shape: 'pill' }, { key: 'second', w: 360, h: 560, shape: 'pill' }], { ol: [900, 84] }),
  T('t11', 'Ratiba', 'Programme', 'type', 'light', 'card', { bg: '#F1EADB', ink: '#1F2A1A', accent: '#4F6A42', panel: '#FFFFFF' }, { nw: 600, upper: false }, [], { ol: [900, 80] }),
  T('t12', 'Pwani', 'Coast', 'photo', 'light', 'line', { bg: '#F2F5EE', ink: '#2A3A24', accent: '#4F6A42', panel: '#FFFFFF' }, { nw: 300, upper: false }, [{ key: 'cover', w: 1080, h: 360, shape: 'rect' }], { st: [900, 116], pad: 2 }),
  T('t13', 'Shampeni', 'Champagne', 'type', 'light', 'card', { bg: '#E8D9B8', ink: '#1A2516', accent: '#B57850', panel: '#FFFFFF' }, { nw: 300, upper: true }, [], { st: [820, 100] }),
  T('t14', 'Mstari', 'Editorial', 'type', 'light', 'line', { bg: '#FFFFFF', ink: '#1F2A1A', accent: '#4F6A42', panel: '#F2F5EE' }, { nw: 800, upper: false }, [], { st: [900, 170], pad: 2 }),
  T('t15', 'Tiketi', 'Ticket', 'type', 'dark', 'ticket', { bg: '#4F6A42', ink: '#1A2516', accent: '#4F6A42', panel: '#F5EFE3' }, { nw: 700, upper: false }, [], { st: [800, 108], pad: 2 }),
  T('t16', 'Fremu', 'Print', 'photo', 'dark', 'card', { bg: '#2A3A24', ink: '#F1EADB', accent: '#E8D9B8', panel: '#FFFFFF' }, { nw: 400, upper: false }, [{ key: 'cover', w: 636, h: 600, shape: 'rect' }], { ol: [600, 60] }),
  T('t17', 'Aya', 'Verse', 'type', 'light', 'line', { bg: '#F2F5EE', ink: '#2A3A24', accent: '#4F6A42', panel: '#FFFFFF' }, { nw: 600, upper: false }, [], { ol: [880, 84] }),
  T('t18', 'Usiku', 'Night', 'photo', 'dark', 'card', { bg: '#1A2516', ink: '#F1EADB', accent: '#E8D9B8', panel: '#F5EFE3' }, { nw: 300, upper: true }, [{ key: 'cover', w: 1080, h: 760, shape: 'fade' }], { ol: [900, 84] }),
  T('t19', 'Kanga', 'Kanga', 'type', 'light', 'card', { bg: '#F5EFE3', ink: '#1A2516', accent: '#B57850', panel: '#FFFFFF' }, { nw: 800, upper: true }, [], { st: [760, 104] }),
  T('t20', 'Dirisha', 'Window', 'photo', 'light', 'line', { bg: '#E2E9DA', ink: '#1F2A1A', accent: '#4F6A42', panel: '#FFFFFF' }, { nw: 300, upper: false }, [{ key: 'cover', w: 720, h: 600, shape: 'window' }], { ol: [900, 84] }),
  T('t21', 'Sauti', 'Our song', 'photo', 'dark', 'card', { bg: '#1A2516', ink: '#F1EADB', accent: '#D29469', panel: '#F5EFE3' }, { nw: 500, upper: false }, [{ key: 'cover', w: 260, h: 260, shape: 'circle' }], { ol: [900, 72] }),
  T('t22', 'Safari', 'Journey', 'type', 'light', 'line', { bg: '#F2F5EE', ink: '#2A3A24', accent: '#B57850', panel: '#FFFFFF' }, { nw: 300, upper: false }, [], { st: [540, 104], pad: 2 }),
  T('t23', 'Albamu', 'Album', 'photo', 'light', 'card', { bg: '#FFFFFF', ink: '#1F2A1A', accent: '#A88D4A', panel: '#F5EFE3' }, { nw: 300, upper: false }, [{ key: 'cover', w: 548, h: 600, shape: 'rect' }, { key: 'second', w: 336, h: 292, shape: 'rect' }, { key: 'third', w: 336, h: 292, shape: 'rect' }], { ol: [900, 84] }),
];

export const byId: Record<string, Template> = {};
TEMPLATES.forEach((t, i) => {
  t.no = String(i + 1).padStart(2, '0');
  byId[t.id] = t;
});
(byId.t15 as Template).inkOn = 'panel';

export function templateFor(id: string | undefined): Template {
  return (id !== undefined ? byId[id] : undefined) ?? (TEMPLATES[0] as Template);
}

export const PRESETS: (Palette & { id: string; name: string })[] = [
  { id: 'linen', name: 'Linen', bg: '#F1EADB', ink: '#1F2A1A', accent: '#4F6A42', panel: '#FFFFFF' },
  { id: 'sage', name: 'Sage', bg: '#E2E9DA', ink: '#2A3A24', accent: '#4F6A42', panel: '#FFFFFF' },
  { id: 'ledger', name: 'Ledger', bg: '#F5EFE3', ink: '#2A3A24', accent: '#A88D4A', panel: '#FFFFFF' },
  { id: 'champagne', name: 'Champagne', bg: '#E8D9B8', ink: '#1A2516', accent: '#B57850', panel: '#FFFFFF' },
  { id: 'coral', name: 'Coral', bg: '#FFFFFF', ink: '#2A3A24', accent: '#D29469', panel: '#F5EFE3' },
  { id: 'forest', name: 'Forest', bg: '#1A2516', ink: '#E8D9B8', accent: '#A88D4A', panel: '#F5EFE3' },
  { id: 'herb', name: 'Herb', bg: '#2A3A24', ink: '#F1EADB', accent: '#C9D6BC', panel: '#F5EFE3' },
  { id: 'brand', name: 'Brand', bg: '#4F6A42', ink: '#FFFFFF', accent: '#E8D9B8', panel: '#FFFFFF' },
];

export const ICONS = [
  'AllInclusive',
  'Favorite',
  'PhotoCamera',
  'LocalBar',
  'Restaurant',
  'Cake',
  'MusicNote',
  'DirectionsCar',
  'LocationOn',
  'Schedule',
] as const;
export type IconName = (typeof ICONS)[number];

// ---------------------------------------------------------------------------
// The design document. One per wedding; the couple edits it in the portal.
// ---------------------------------------------------------------------------

export interface Venue {
  name: string;
  addr: string;
  time: string;
  /** Public R2 URL of a venue photo (the couple's upload, or a linked venue vendor's cover), or null. */
  photo?: string | null;
  /** A short blurb for guests, per language. */
  sw?: string;
  en?: string;
}
/** One celebration colour: swatch, names in both languages, optional outfit photo. */
export interface Attire {
  hex: string;
  sw: string;
  en: string;
  photo: string | null;
}
/** One "A note for our guests" row. */
export interface Note {
  sw: string;
  en: string;
  bodySw: string;
  bodyEn: string;
}
export interface RatibaItem {
  t: string;
  icon: string;
  sw: string;
  en: string;
  place?: string;
}
export interface StoryStop {
  y: string;
  sw: string;
  en: string;
}
export interface KamatiContact {
  name: string;
  sw: string;
  en: string;
  phone: string;
}
export interface Crop {
  x: number;
  y: number;
  z: number;
}
export interface Photo {
  id: string;
  src: string;
  w: number;
  h: number;
}
export interface Music {
  title: string;
  artist: string;
  /** Spotify, YouTube or any page with the full song. */
  link: string;
  on: boolean;
  auto: boolean;
  demo: boolean;
  /** Public URL of an uploaded song (R2), or null for the demo melody. */
  file: string | null;
}
export type SectionKey =
  | 'rsvp'
  | 'song'
  | 'countdown'
  | 'quote'
  | 'calendar'
  | 'verse'
  | 'ratiba'
  | 'venues'
  | 'dress'
  | 'story'
  | 'gallery'
  | 'michango'
  | 'kamati'
  | 'notes'
  | 'wishes';

export type WordKey = 'host' | 'invite' | 'verse' | 'verseRef' | 'closing' | 'dressNote' | 'kanga' | 'quote' | 'quoteBy' | 'tagline';

export interface PageRecipe {
  open: 'envelope' | 'curtain' | 'tear' | 'photo' | 'spin' | 'fade' | 'unfold' | 'none';
  hero: 'card' | 'photo' | 'type' | 'date' | 'vinyl' | 'route';
  head: 'center' | 'left' | 'num' | 'frame';
  rhythm: 'alt' | 'cards' | 'bands' | 'rules';
  ratiba: 'line' | 'cards' | 'ticket' | 'big';
  gallery: 'grid' | 'carousel' | 'prints' | 'mosaic';
  count: 'boxes' | 'big' | 'line';
  rsvp: 'band' | 'card' | 'ticket';
  player: 'pill' | 'disc' | 'bar';
  order: SectionKey[];
}

export interface InviteDesign {
  v: 1;
  tpl: string;
  lang: Lang;
  faith: Faith;
  /** Card number prefix, e.g. "0468" in "0468-001". */
  code: string;
  names: { a: string; b: string };
  /** YYYY-MM-DD, local Dar es Salaam date. */
  date: string;
  ceremony: Venue;
  reception: Venue;
  rsvpBy: string;
  ratiba: RatibaItem[];
  /** Dress-code colours, hex. Mirrors attire[].hex; the card image reads this. */
  dress: string[];
  /** The celebration colours with names and outfit photos; empty means derive from `dress`. */
  attire: Attire[];
  story: StoryStop[];
  /** "A note for our guests" rows; empty means the defaults. */
  notes: Note[];
  michango: { mpesa: string; tigo: string; airtel: string; name: string };
  kamati: KamatiContact[];
  words: { sw: Partial<Record<WordKey, string>>; en: Partial<Record<WordKey, string>> };
  over: Record<string, { pal?: Partial<Palette>; type?: Partial<TypeOpts> }>;
  photos: Photo[];
  slots: Partial<Record<SlotKey, string>>;
  crops: Record<string, Crop>;
  gallery: { pid: string; crop: Crop }[];
  sections: Partial<Record<SectionKey, boolean>>;
  music: Music;
  pageOver: Record<string, Partial<PageRecipe>>;
}

export interface TypeOpts {
  nw: number;
  upper: boolean;
  bw: number;
  labels: 'mono' | 'sans';
}

/**
 * Single or double card, vendored from wedding-shared-types (types/card-kind.ts).
 * Not the seat count: a card for a party of forty is still a SINGLE card.
 */
export type CardKind = 'single' | 'double';

/** How the kind is printed on the card: the same word in both languages. */
export function cardKindLabel(kind: CardKind | undefined): 'SINGLE' | 'DOUBLE' {
  return kind === 'double' ? 'DOUBLE' : 'SINGLE';
}

/** The kind a placeholder guest gets when nobody chose one: two seats or more is a double. */
export function cardKindForSeats(seats: number | null | undefined): CardKind {
  return typeof seats === 'number' && seats >= 2 ? 'double' : 'single';
}

/** The person a card or page is for. Card number = design code + id. */
export interface Guest {
  id: string;
  name: string;
  seats: number;
  /** Missing on payloads from before the card kind existed: read as single. */
  kind?: CardKind;
  phone?: string;
  rsvp?: 'yes' | 'no' | 'maybe' | 'pending';
  coming?: number;
  pledge?: number;
  paid?: number;
}

export const SECTION_KEYS: SectionKey[] = [
  'rsvp',
  'song',
  'countdown',
  'quote',
  'calendar',
  'verse',
  'ratiba',
  'venues',
  'dress',
  'story',
  'gallery',
  'michango',
  'kamati',
  'notes',
  'wishes',
];

// ---------------------------------------------------------------------------
// Wording
// ---------------------------------------------------------------------------

type ByFaith = Record<Faith, string>;
export interface Strings {
  host: ByFaith;
  invite: ByFaith;
  verse: ByFaith;
  verseRef: ByFaith;
  ceremony: ByFaith;
  reception: string;
  closing: string;
  dressNote: string;
  marrying: string;
  invitation: string;
  invFor: string;
  card: string;
  gate: string;
  seats: (n: number) => string;
  wd: string[];
  wdHead: string[];
  mo: string[];
  welcome: string;
  rsvpBy: string;
  yes: string;
  no: string;
  maybe: string;
  howMany: string;
  doneYes: string;
  doneNo: string;
  doneMaybe: string;
  change: string;
  units: string[];
  addCal: string;
  openMap: string;
  pledge: string;
  paid: string;
  balance: string;
  payTo: string;
  accName: string;
  payNow: string;
  payNote: string;
  amount: string;
  sendPrompt: string;
  promptSent: string;
  noPledge: string;
  call: string;
  chat: string;
  passNote: string;
  download: string;
  madeWith: string;
  kanga: string;
  ourSong: string;
  tapOpen: string;
  tapTear: string;
  tapPlay: string;
  withMusic: string;
  forLabel: string;
  open: string;
  listen: string;
  timeH: string;
  eventH: string;
  play: string;
  pause: string;
  route: string;
  guestFallback: string;
  getApp: string;
  getAppNote: string;
  msgLabel: string;
  msgPlaceholder: string;
  sendReply: string;
  sending: string;
  rsvpError: string;
  rsvpClosed: string;
  rsvpExpired: string;
  rsvpOwnLink: string;
  payFromOther: string;
  phoneLabel: string;
  payFailed: string;
  payNotReady: string;
  yourPhone: string;
  addGoogle: string;
  addIcs: string;
  calNote: string;
  spotifyNote: string;
  tapAgain: string;
  comingSoon: string;
  appStore: string;
  playStore: string;
  appPageNote: string;
  appOpenInvite: string;
  /** Default "A word from the couple" quote and its signature. */
  quote: string;
  quoteBy: string;
  tagline: string;
  openingInvite: string;
  tapMusic: string;
  musicPlaying: string;
  scrollDiscover: string;
  myPass: string;
  keepReady: string;
  yourPass: string;
  entryFor: (n: number) => string;
  tapEnlarge: string;
  closeLabel: string;
  openMapFor: (venue: string) => string;
  venueBlurb: string;
  /** The default line on the ceremony card (the reception has `venueBlurb`). */
  venueBlurbCeremony: string;
  wearColours: string;
  men: string;
  women: string;
  viewFull: string;
  viewLess: string;
  notesLead: string;
  defaultNotes: Note[];
  rsvpContacts: string;
  wishesLead: string;
  wishesTitle: (couple: string) => string;
  wishName: string;
  wishNamePh: string;
  wishMessage: string;
  wishMessagePh: string;
  sendWishes: string;
  wishesSent: string;
  wishesSentBody: string;
  wishesMissing: string;
  wishesFailed: string;
  needChange: string;
  updateResponse: string;
  H: Record<SectionKey | 'pass' | 'faqs' | 'party' | 'guestbook' | 'gifts' | 'travel', string>;
}

/** The three guest notes every page shows until the couple writes their own. */
export const DEFAULT_NOTES: Note[] = [
  { sw: 'Watu wazima tu', en: 'Adults only', bodySw: 'Tunaomba kwa heshima sherehe iwe ya watu wazima pekee.', bodyEn: 'We kindly request an adults-only celebration.' },
  { sw: 'Tafadhali wahi', en: 'Kindly be on time', bodySw: 'Kila wakati mzuri unastahili kuwahi.', bodyEn: 'Every beautiful moment is worth arriving for.' },
  { sw: 'Mwaliko ni lazima', en: 'Invitation required', bodySw: 'Tafadhali kuwa na kadi yako ya QR tayari kwa kuskaniwa mlangoni.', bodyEn: 'Please have your personal QR entry pass ready for scanning.' },
];

export const STR: Record<Lang, Strings> = {
  sw: {
    host: { church: 'Kwa pamoja na familia zao', nikah: 'Bismillahir Rahmanir Rahim', civil: 'Kwa pamoja na familia zao' },
    invite: {
      church: 'wanakualika kwa furaha kwenye harusi yao',
      nikah: 'wanakualika kwa furaha kwenye Nikah na Walima',
      civil: 'wanakualika kwa furaha kwenye harusi yao',
    },
    verse: {
      church: 'Hata wamekuwa si wawili tena, bali mwili mmoja.',
      nikah: 'Na katika ishara zake ni kwamba amewaumbia wenza kutokana na nafsi zenu, ili mpate utulivu kwao.',
      civil: 'Pendo letu ni safari tunayoianza pamoja, na tunatamani muwe pamoja nasi.',
    },
    verseRef: { church: 'Mathayo 19:6', nikah: 'Qur’an 30:21', civil: '' },
    ceremony: { church: 'Ibada ya ndoa', nikah: 'Nikah', civil: 'Ndoa' },
    reception: 'Sherehe',
    closing: 'Karibu tusherehekee pamoja',
    dressNote: 'Mavazi rasmi. Tafadhali vaa rangi hizi.',
    marrying: 'Tunaoana',
    invitation: 'Mwaliko wa harusi',
    invFor: 'Mwaliko kwa',
    card: 'Kadi',
    gate: 'Onyesha kadi hii mlangoni',
    seats: (n) => (n === 1 ? 'Mtu 1' : `Watu ${n}`),
    wd: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
    wdHead: ['Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jms', 'Jpl'],
    mo: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
    welcome: 'Karibu',
    rsvpBy: 'Tafadhali thibitisha kabla ya',
    yes: 'Nitafika',
    no: 'Sitaweza kufika',
    maybe: 'Bado sina uhakika',
    howMany: 'Mtakuja wangapi?',
    doneYes: 'Umethibitisha',
    doneNo: 'Asante kwa kutujulisha',
    doneMaybe: 'Tutakusubiri',
    change: 'Badilisha jibu',
    units: ['Siku', 'Saa', 'Dakika', 'Sekunde'],
    addCal: 'Ongeza kwenye kalenda',
    openMap: 'Fungua ramani',
    pledge: 'Ahadi',
    paid: 'Umelipa',
    balance: 'Baki',
    payTo: 'Lipa kwa',
    accName: 'Jina la akaunti',
    payNow: 'Changia sasa',
    payNote: 'Pesa inaenda moja kwa moja kwenye akaunti ya wanandoa, si kwetu.',
    amount: 'Chagua kiasi',
    sendPrompt: 'Tuma ombi la malipo',
    promptSent: 'Ombi la malipo limetumwa kwa',
    noPledge: 'Bado hujaweka ahadi. Unaweza kuchangia kiasi chochote.',
    call: 'Piga',
    chat: 'Ujumbe',
    passNote: 'QR moja kwa kila kitu: mlangoni, RSVP na michango.',
    download: 'Hifadhi kadi',
    madeWith: 'Mialiko ya kidijitali · Wedding.co.tz',
    kanga: 'Mapenzi ni kikohozi, hayafichiki',
    ourSong: 'Wimbo wetu',
    tapOpen: 'Gusa kufungua mwaliko',
    tapTear: 'Gusa kuchana tiketi',
    tapPlay: 'Gusa kucheza na kufungua',
    withMusic: 'Mwaliko huu una muziki',
    forLabel: 'Kwa',
    open: 'Fungua',
    listen: 'Sikiliza wimbo kamili',
    timeH: 'Saa',
    eventH: 'Tukio',
    play: 'Cheza',
    pause: 'Simamisha',
    route: 'Safari yetu',
    guestFallback: 'Mgeni wetu',
    getApp: 'Pakua app ya Wedding',
    getAppNote: 'Ratiba, kadi yako na michango, vyote kwenye simu yako.',
    msgLabel: 'Ujumbe kwa maharusi',
    msgPlaceholder: 'Hongera sana! Tunasubiri kwa hamu.',
    sendReply: 'Tuma jibu',
    sending: 'Inatuma…',
    rsvpError: 'Jibu lako halijafika. Angalia mtandao kisha jaribu tena.',
    rsvpClosed: 'Muda wa kuthibitisha umeisha. Wasiliana na maharusi moja kwa moja.',
    rsvpExpired: 'Mwaliko huu umeisha muda wake. Wasiliana na maharusi.',
    rsvpOwnLink: 'Tafuta kiungo chako binafsi kwenye mwaliko uliotumiwa kwa SMS au WhatsApp ili kuthibitisha.',
    payFromOther: 'Lipa kwa namba nyingine',
    phoneLabel: 'Namba ya simu ya kulipia',
    payFailed: 'Ombi la malipo halikutumwa. Jaribu tena baada ya muda mfupi.',
    payNotReady: 'Malipo kwa simu bado hayajawashwa. Tumia namba zilizo hapa juu.',
    yourPhone: 'simu yako',
    addGoogle: 'Google Calendar',
    addIcs: 'Apple, Outlook (.ics)',
    calNote: 'Faili la kalenda linakukumbusha siku moja kabla na dakika 30 kabla.',
    spotifyNote: 'Wimbo kamili uko Spotify',
    tapAgain: 'Gusa tena kucheza muziki',
    comingSoon: 'Inakuja hivi karibuni',
    appStore: 'App Store',
    playStore: 'Google Play',
    appPageNote: 'App inakuja hivi karibuni kwenye App Store na Google Play. Kwa sasa, mwaliko wako unafunguka hapa kwenye kivinjari, hakuna haja ya kupakua chochote.',
    appOpenInvite: 'Fungua mwaliko wako kupitia kiungo ulichotumiwa kwa SMS au WhatsApp.',
    quote: 'Kuwa nanyi tunapoanza sura hii mpya ni zaidi ya maneno yanavyoweza kueleza. Tunasubiri kwa hamu kusherehekea, kucheka na kutengeneza kumbukumbu zitakazodumu nasi muda mrefu baada ya siku hii nzuri.',
    quoteBy: '',
    tagline: 'Sura mpya nzuri inaanza',
    openingInvite: 'Tunafungua mwaliko wako',
    tapMusic: 'Gusa kwa muziki',
    musicPlaying: 'Muziki unacheza',
    scrollDiscover: 'Sogeza chini kuona zaidi',
    myPass: 'Kadi ya kuingia',
    keepReady: 'Iweke tayari kwa ajili ya sherehe',
    yourPass: 'Kadi yako ya kuingia',
    entryFor: (n) => (n === 1 ? 'Mtu mmoja' : n === 2 ? 'Kuingia watu wawili' : `Kuingia watu ${n}`),
    tapEnlarge: 'Gusa kukuza',
    closeLabel: 'Funga',
    openMapFor: (venue) => `Fungua ramani ya ${venue.toLowerCase()}`,
    venueBlurb: 'Karibuni kwenye jioni ya sherehe, chakula na kumbukumbu zisizosahaulika.',
    venueBlurbCeremony: 'Karibuni mshuhudie tunapofunga ndoa yetu.',
    wearColours: 'Sherehekeeni nasi kwa rangi hizi',
    men: 'Wanaume',
    women: 'Wanawake',
    viewFull: 'Ona ratiba kamili',
    viewLess: 'Ficha ratiba',
    notesLead: 'Mambo ya kujua',
    defaultNotes: DEFAULT_NOTES,
    rsvpContacts: 'Wa kuwasiliana nao',
    wishesLead: 'Andika baraka, kumbukumbu au maneno machache kwa miaka ijayo.',
    wishesTitle: (couple) => `Waandikie ${couple}`,
    wishName: 'Jina lako',
    wishNamePh: 'Mfano: Mama Asha',
    wishMessage: 'Ujumbe wako',
    wishMessagePh: 'Hongereni sana! Mungu awabariki…',
    sendWishes: 'Tuma salamu zako',
    wishesSent: 'Salamu zimepokelewa',
    wishesSentBody: 'Ujumbe wako umefika salama kwa maharusi.',
    wishesMissing: 'Andika jina lako na salamu zako.',
    wishesFailed: 'Imeshindikana kutuma. Jaribu tena.',
    needChange: 'Unahitaji kubadilisha jibu lako?',
    updateResponse: 'Badilisha jibu',
    H: {
      rsvp: 'Utafika?',
      song: 'Wimbo wetu',
      countdown: 'Zimebaki',
      quote: 'Neno kutoka kwa maharusi',
      calendar: 'Tarehe',
      verse: 'Neno',
      ratiba: 'Ratiba ya sherehe',
      venues: 'Mahali',
      dress: 'Rangi za sherehe',
      story: 'Historia yetu',
      gallery: 'Picha',
      michango: 'Michango',
      kamati: 'Kamati ya harusi',
      notes: 'Taarifa kwa wageni wetu',
      wishes: 'Salamu kwa maharusi',
      pass: 'Kadi ya kuingia',
      faqs: 'Maswali',
      party: 'Wapambe',
      guestbook: 'Salamu',
      gifts: 'Zawadi',
      travel: 'Safari na malazi',
    },
  },
  en: {
    host: { church: 'Together with their families', nikah: 'Bismillahir Rahmanir Rahim', civil: 'Together with their families' },
    invite: {
      church: 'request the pleasure of your company at their wedding',
      nikah: 'invite you to their Nikah and Walima',
      civil: 'request the pleasure of your company at their wedding',
    },
    verse: {
      church: 'So they are no longer two, but one flesh.',
      nikah: 'And among His signs is that He created for you spouses from among yourselves, that you may find tranquillity in them.',
      civil: 'Our love is a journey we begin together, and we would love you there with us.',
    },
    verseRef: { church: 'Matthew 19:6', nikah: 'Qur’an 30:21', civil: '' },
    ceremony: { church: 'Wedding service', nikah: 'Nikah', civil: 'Ceremony' },
    reception: 'Reception',
    closing: 'We can’t wait to celebrate with you',
    dressNote: 'Formal. Please wear these colours.',
    marrying: 'We’re getting married',
    invitation: 'Wedding invitation',
    invFor: 'Invitation for',
    card: 'Card',
    gate: 'Show this card at the gate',
    seats: (n) => (n === 1 ? '1 guest' : `${n} guests`),
    wd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    wdHead: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    mo: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    welcome: 'Welcome',
    rsvpBy: 'Please reply by',
    yes: 'I’ll be there',
    no: 'I can’t make it',
    maybe: 'Not sure yet',
    howMany: 'How many of you are coming?',
    doneYes: 'Confirmed',
    doneNo: 'Thank you for letting us know',
    doneMaybe: 'We hope to see you',
    change: 'Change answer',
    units: ['Days', 'Hours', 'Minutes', 'Seconds'],
    addCal: 'Add to calendar',
    openMap: 'Open map',
    pledge: 'Pledge',
    paid: 'Paid',
    balance: 'Balance',
    payTo: 'Pay to',
    accName: 'Account name',
    payNow: 'Contribute now',
    payNote: 'Money goes straight to the couple’s own account, never ours.',
    amount: 'Choose an amount',
    sendPrompt: 'Send payment prompt',
    promptSent: 'Payment prompt sent to',
    noPledge: 'No pledge yet. You can contribute any amount.',
    call: 'Call',
    chat: 'Message',
    passNote: 'One QR for everything: the gate, RSVP and michango.',
    download: 'Save card',
    madeWith: 'Digital invitations · Wedding.co.tz',
    kanga: 'Love is like a cough, it cannot be hidden',
    ourSong: 'Our song',
    tapOpen: 'Tap to open your invitation',
    tapTear: 'Tap to tear the ticket',
    tapPlay: 'Tap to play and open',
    withMusic: 'This invitation has music',
    forLabel: 'For',
    open: 'Open',
    listen: 'Listen to the full song',
    timeH: 'Time',
    eventH: 'Moment',
    play: 'Play',
    pause: 'Pause',
    route: 'Our journey',
    guestFallback: 'Our guest',
    getApp: 'Get the Wedding app',
    getAppNote: 'The programme, your card and contributions, all on your phone.',
    msgLabel: 'A message for the couple',
    msgPlaceholder: 'Congratulations! We cannot wait.',
    sendReply: 'Send my reply',
    sending: 'Sending…',
    rsvpError: 'Your reply did not go through. Check your connection and try again.',
    rsvpClosed: 'Replies are closed. Please contact the couple directly.',
    rsvpExpired: 'This invitation has expired. Please contact the couple.',
    rsvpOwnLink: 'Use the personal link in the invitation you got by SMS or WhatsApp to reply.',
    payFromOther: 'Pay from another number',
    phoneLabel: 'Phone number to pay from',
    payFailed: 'The payment prompt was not sent. Please try again in a moment.',
    payNotReady: 'Mobile payment prompts are not switched on yet. Use the numbers above.',
    yourPhone: 'your phone',
    addGoogle: 'Google Calendar',
    addIcs: 'Apple, Outlook (.ics)',
    calNote: 'The calendar file reminds you the day before and 30 minutes before.',
    spotifyNote: 'The full song is on Spotify',
    tapAgain: 'Tap again to play the music',
    comingSoon: 'Coming soon',
    appStore: 'App Store',
    playStore: 'Google Play',
    appPageNote: 'The app is coming soon to the App Store and Google Play. Until then your invitation opens right here in the browser, nothing to install.',
    appOpenInvite: 'Open your invitation from the link you got by SMS or WhatsApp.',
    quote: 'To have you beside us as we begin this new chapter means more than words can express. We cannot wait to celebrate, laugh, and create memories that will remain with us long after this beautiful day.',
    quoteBy: '',
    tagline: 'A beautiful chapter begins',
    openingInvite: 'Opening your invitation',
    tapMusic: 'Tap for music',
    musicPlaying: 'Music playing',
    scrollDiscover: 'Scroll to discover',
    myPass: 'My entry pass',
    keepReady: 'Keep this ready for the celebration',
    yourPass: 'Your entry pass',
    entryFor: (n) => (n === 1 ? 'Single' : n === 2 ? 'Entry for two' : `Entry for ${n}`),
    tapEnlarge: 'Tap to enlarge',
    closeLabel: 'Close',
    openMapFor: (venue) => `Open ${venue.toLowerCase()} map`,
    venueBlurb: 'Join us for an evening of celebration, dinner and unforgettable memories.',
    venueBlurbCeremony: 'Join us as we exchange our vows.',
    wearColours: 'Celebrate with us in these colours',
    men: 'Men',
    women: 'Women',
    viewFull: 'View full programme',
    viewLess: 'Show less',
    notesLead: 'Good to know',
    defaultNotes: DEFAULT_NOTES,
    rsvpContacts: 'RSVP contacts',
    wishesLead: 'Share a blessing, a memory, or a few words for the years ahead.',
    wishesTitle: (couple) => `Leave a note for ${couple}`,
    wishName: 'Your name',
    wishNamePh: 'e.g. Auntie Asha',
    wishMessage: 'Your message',
    wishMessagePh: 'Congratulations! Wishing you a lifetime of joy…',
    sendWishes: 'Send your wishes',
    wishesSent: 'Wishes received',
    wishesSentBody: 'Your message is safely with the happy couple.',
    wishesMissing: 'Add your name and your wishes.',
    wishesFailed: 'Could not send. Please try again.',
    needChange: 'Need to change your response?',
    updateResponse: 'Update response',
    H: {
      rsvp: 'Will you attend?',
      song: 'Our song',
      countdown: 'Counting down',
      quote: 'A word from the couple',
      calendar: 'The date',
      verse: 'Blessing',
      ratiba: 'Celebration programme',
      venues: 'Venues',
      dress: 'Celebration colours',
      story: 'Our story',
      gallery: 'Photos',
      michango: 'Contributions',
      kamati: 'Wedding committee',
      notes: 'A note for our guests',
      wishes: 'Well wishes',
      pass: 'Entry pass',
      faqs: 'Questions',
      party: 'Wedding party',
      guestbook: 'Wishes',
      gifts: 'Gifts',
      travel: 'Travel and stay',
    },
  },
};

// ---------------------------------------------------------------------------
// Page recipes: each template has its own web page rhythm.
// ---------------------------------------------------------------------------

/**
 * Every template's page recipe. The programme is always the vertical timeline
 * by default (with "View full programme" when it is long); a couple can still
 * choose cards, a board or big times under Web page style.
 */
function R(
  open: PageRecipe['open'],
  hero: PageRecipe['hero'],
  head: PageRecipe['head'],
  rhythm: PageRecipe['rhythm'],
  ratiba: PageRecipe['ratiba'],
  gallery: PageRecipe['gallery'],
  count: PageRecipe['count'],
  rsvp: PageRecipe['rsvp'],
  player: PageRecipe['player'],
  first: SectionKey[] = [],
): PageRecipe {
  const order = SECTION_KEYS.slice();
  first
    .slice()
    .reverse()
    .forEach((k) => {
      order.splice(order.indexOf(k), 1);
      order.unshift(k);
    });
  return { open, hero, head, rhythm, ratiba, gallery, count, rsvp, player, order };
}

export const PAGES: Record<string, PageRecipe> = {
  t01: R('envelope', 'card', 'center', 'alt', 'line', 'grid', 'boxes', 'band', 'pill'),
  t02: R('curtain', 'type', 'frame', 'bands', 'line', 'mosaic', 'big', 'card', 'bar', ['verse', 'countdown']),
  t03: R('envelope', 'card', 'center', 'alt', 'line', 'prints', 'boxes', 'band', 'disc'),
  t04: R('photo', 'photo', 'left', 'cards', 'line', 'carousel', 'big', 'card', 'pill', ['countdown', 'rsvp', 'gallery']),
  t05: R('curtain', 'photo', 'num', 'rules', 'line', 'mosaic', 'line', 'ticket', 'bar', ['rsvp', 'ratiba', 'venues']),
  t06: R('fade', 'type', 'num', 'rules', 'line', 'grid', 'line', 'card', 'pill', ['countdown', 'verse']),
  t07: R('fade', 'date', 'left', 'alt', 'line', 'grid', 'big', 'band', 'bar', ['calendar', 'countdown']),
  t08: R('envelope', 'card', 'center', 'bands', 'line', 'carousel', 'boxes', 'card', 'disc', ['calendar']),
  t09: R('fade', 'card', 'center', 'cards', 'line', 'prints', 'boxes', 'band', 'disc'),
  t10: R('curtain', 'card', 'left', 'alt', 'line', 'mosaic', 'boxes', 'card', 'pill', ['story']),
  t11: R('tear', 'card', 'num', 'rules', 'line', 'grid', 'line', 'ticket', 'bar', ['ratiba']),
  t12: R('photo', 'photo', 'left', 'alt', 'line', 'carousel', 'big', 'band', 'pill', ['gallery']),
  t13: R('envelope', 'card', 'frame', 'cards', 'line', 'prints', 'boxes', 'card', 'disc', ['rsvp', 'verse']),
  t14: R('fade', 'type', 'num', 'rules', 'line', 'mosaic', 'line', 'ticket', 'bar', ['rsvp', 'ratiba', 'venues']),
  t15: R('tear', 'card', 'num', 'cards', 'line', 'carousel', 'line', 'ticket', 'bar', ['rsvp', 'ratiba', 'venues']),
  t16: R('photo', 'card', 'center', 'bands', 'line', 'prints', 'big', 'card', 'disc', ['gallery', 'story']),
  t17: R('fade', 'card', 'center', 'alt', 'line', 'grid', 'boxes', 'band', 'pill', ['verse']),
  t18: R('curtain', 'photo', 'frame', 'bands', 'line', 'carousel', 'big', 'card', 'disc', ['countdown']),
  t19: R('unfold', 'card', 'frame', 'bands', 'line', 'mosaic', 'big', 'band', 'pill', ['rsvp', 'countdown', 'dress']),
  t20: R('curtain', 'card', 'left', 'cards', 'line', 'grid', 'boxes', 'card', 'pill', ['rsvp', 'gallery']),
  t21: R('spin', 'vinyl', 'num', 'rules', 'line', 'carousel', 'line', 'ticket', 'disc', ['song']),
  t22: R('fade', 'route', 'left', 'alt', 'line', 'prints', 'big', 'band', 'bar', ['story', 'countdown']),
  t23: R('photo', 'card', 'center', 'cards', 'line', 'mosaic', 'boxes', 'card', 'pill', ['gallery']),
};

export function page(d: InviteDesign, tplId: string): PageRecipe & { custom: boolean } {
  const base = PAGES[tplId] ?? (PAGES.t01 as PageRecipe);
  const o = d.pageOver?.[tplId] ?? {};
  const r = { ...base, ...o };
  const ord = (o.order ?? base.order).filter((k) => SECTION_KEYS.includes(k));
  SECTION_KEYS.forEach((k) => {
    if (!ord.includes(k)) ord.push(k);
  });
  return { ...r, order: ord, custom: Object.keys(o).length > 0 };
}

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

export function hex(c: string | undefined): string {
  let s = String(c ?? '').trim();
  if (/^#[0-9a-f]{3}$/i.test(s)) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return /^#[0-9a-f]{6}$/i.test(s) ? s.toUpperCase() : '#000000';
}
function rgb(c: string): [number, number, number] {
  const h = hex(c).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum(c: string): number {
  const v = rgb(c).map((x) => {
    const y = x / 255;
    return y <= 0.03928 ? y / 12.92 : Math.pow((y + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
export function contrast(a: string, b: string): number {
  const A = lum(a);
  const B = lum(b);
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
}
export function onColor(bg: string): string {
  return contrast(bg, '#1F2A1A') >= contrast(bg, '#FFFFFF') ? '#1F2A1A' : '#FFFFFF';
}
/** CSS `color-mix(in srgb, a pct%, b)`, computed. */
export function mix(a: string, pct: number, b: string): string {
  const A = rgb(a);
  const B = rgb(b);
  const p = pct / 100;
  const out = A.map((x, i) => Math.round(x * p + (B[i] as number) * (1 - p)));
  return `#${out.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
/** `color-mix(in srgb, a pct%, transparent)` as rgba. */
export function alpha(a: string, pct: number): string {
  const [r, g, b] = rgb(a);
  return `rgba(${r},${g},${b},${(pct / 100).toFixed(3)})`;
}

export interface Theme extends Palette, TypeOpts {
  /** Text colour on the panel. */
  pink: string;
  onacc: string;
  /** Accent where it sits on the background, or ink when contrast is too low. */
  accBg: string;
  /** Accent where it sits on the panel. */
  accPn: string;
  custom: boolean;
  labelFont: string;
}

export const FONT_SANS = "'Manrope', system-ui, sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

export function theme(d: InviteDesign, tplId: string): Theme {
  const t = templateFor(tplId);
  const o = d.over?.[t.id] ?? {};
  const pal: Palette = { ...t.pal, ...(o.pal ?? {}) };
  const ty: TypeOpts = { nw: t.type.nw, upper: t.type.upper, bw: 400, labels: 'mono', ...(o.type ?? {}) };
  const pink = onColor(pal.panel);
  return {
    ...pal,
    ...ty,
    pink,
    onacc: onColor(pal.accent),
    accBg: contrast(pal.accent, pal.bg) >= 3 ? pal.accent : pal.ink,
    accPn: contrast(pal.accent, pal.panel) >= 3 ? pal.accent : pink,
    custom: Boolean(o.pal ?? o.type),
    labelFont: ty.labels === 'sans' ? FONT_SANS : FONT_MONO,
  };
}

export function words(d: InviteDesign, lang: Lang) {
  const S = STR[lang];
  const f = d.faith ?? 'church';
  const o = d.words?.[lang] ?? {};
  const pick = (k: WordKey, def: string) => (o[k] !== undefined && o[k] !== '' ? (o[k] as string) : def);
  return {
    host: pick('host', S.host[f]),
    invite: pick('invite', S.invite[f]),
    verse: pick('verse', S.verse[f]),
    verseRef: pick('verseRef', S.verseRef[f]),
    closing: pick('closing', S.closing),
    dressNote: pick('dressNote', S.dressNote),
    kanga: pick('kanga', S.kanga),
    quote: pick('quote', S.quote),
    quoteBy: pick('quoteBy', `${d.names?.a ?? ''} & ${d.names?.b ?? ''}`),
    tagline: pick('tagline', S.tagline),
    ceremony: S.ceremony[f],
    reception: S.reception,
  };
}

// ---------------------------------------------------------------------------
// Celebration colours and guest notes
// ---------------------------------------------------------------------------

/** Named colours a couple is likely to pick, with the nearest-match names guests read. */
export const NAMED_COLOURS: { hex: string; en: string; sw: string }[] = [
  { hex: '#8A9A5B', en: 'Sage green', sw: 'Kijani cha sage' },
  { hex: '#4F6A42', en: 'Forest green', sw: 'Kijani kibichi' },
  { hex: '#2E8B57', en: 'Emerald', sw: 'Kijani cha zumaridi' },
  { hex: '#C9D6BC', en: 'Mint', sw: 'Kijani hafifu' },
  { hex: '#808000', en: 'Olive', sw: 'Kijani cha zeituni' },
  { hex: '#DCAE96', en: 'Dusty rose', sw: 'Waridi hafifu' },
  { hex: '#F4C2C2', en: 'Blush pink', sw: 'Pinki hafifu' },
  { hex: '#E75480', en: 'Pink', sw: 'Pinki' },
  { hex: '#FF7F50', en: 'Coral', sw: 'Rangi ya matumbawe' },
  { hex: '#B22222', en: 'Red', sw: 'Nyekundu' },
  { hex: '#800020', en: 'Burgundy', sw: 'Nyekundu iliyokoza' },
  { hex: '#800000', en: 'Maroon', sw: 'Maruni' },
  { hex: '#F7E7CE', en: 'Champagne', sw: 'Shampeni' },
  { hex: '#FFFDD0', en: 'Cream', sw: 'Krimu' },
  { hex: '#F5F5DC', en: 'Beige', sw: 'Beji' },
  { hex: '#D4AF37', en: 'Gold', sw: 'Dhahabu' },
  { hex: '#A88D4A', en: 'Antique gold', sw: 'Dhahabu ya kale' },
  { hex: '#FFD700', en: 'Yellow', sw: 'Njano' },
  { hex: '#FF8C00', en: 'Orange', sw: 'Machungwa' },
  { hex: '#B57850', en: 'Terracotta', sw: 'Udongo' },
  { hex: '#8B4513', en: 'Brown', sw: 'Kahawia' },
  { hex: '#C0C0C0', en: 'Silver', sw: 'Fedha' },
  { hex: '#808080', en: 'Grey', sw: 'Kijivu' },
  { hex: '#1F2A44', en: 'Navy', sw: 'Buluu iliyokoza' },
  { hex: '#4169E1', en: 'Royal blue', sw: 'Buluu ya kifalme' },
  { hex: '#87CEEB', en: 'Sky blue', sw: 'Buluu ya anga' },
  { hex: '#B0C4DE', en: 'Dusty blue', sw: 'Buluu hafifu' },
  { hex: '#008080', en: 'Teal', sw: 'Rangi ya bahari' },
  { hex: '#40E0D0', en: 'Turquoise', sw: 'Turkuaz' },
  { hex: '#6A0DAD', en: 'Purple', sw: 'Zambarau' },
  { hex: '#C8A2C8', en: 'Lilac', sw: 'Zambarau hafifu' },
  { hex: '#E6E6FA', en: 'Lavender', sw: 'Lavenda' },
  { hex: '#FFFFFF', en: 'White', sw: 'Nyeupe' },
  { hex: '#FFFFF0', en: 'Ivory', sw: 'Rangi ya pembe' },
  { hex: '#1F2A1A', en: 'Black', sw: 'Nyeusi' },
];

/** The nearest named colour to a hex, in both languages. */
export function colourName(c: string): { en: string; sw: string } {
  const [r, g, b] = rgb(c);
  let best = NAMED_COLOURS[0] as (typeof NAMED_COLOURS)[number];
  let bestD = Infinity;
  for (const n of NAMED_COLOURS) {
    const [nr, ng, nb] = rgb(n.hex);
    // Weighted RGB distance: the eye is most sensitive to green, least to blue.
    const dd = 2 * (r - nr) ** 2 + 4 * (g - ng) ** 2 + 3 * (b - nb) ** 2;
    if (dd < bestD) {
      bestD = dd;
      best = n;
    }
  }
  return { en: best.en, sw: best.sw };
}

/** The celebration colours to show: the named ones, or the dress hexes named automatically. */
export function attireOf(d: InviteDesign): Attire[] {
  if (d.attire.length > 0) {
    return d.attire.map((a) => {
      const auto = colourName(a.hex);
      return { hex: hex(a.hex), en: a.en || auto.en, sw: a.sw || auto.sw, photo: a.photo };
    });
  }
  return d.dress.map((c) => ({ hex: hex(c), ...colourName(c), photo: null }));
}

/** The guest notes to show, in one language: the couple's rows, or the defaults. */
export function notesOf(d: InviteDesign, lang: Lang): { title: string; body: string }[] {
  const rows = d.notes.length > 0 ? d.notes : DEFAULT_NOTES;
  return rows
    .map((n) => ({
      title: (lang === 'sw' ? n.sw : n.en) || n.en || n.sw,
      body: (lang === 'sw' ? n.bodySw : n.bodyEn) || n.bodyEn || n.bodySw,
    }))
    .filter((n) => n.title !== '');
}

/** The venue blurb in one language, or the default line for a ceremony or a reception. */
export function venueBlurb(v: Venue, lang: Lang, kind: 'ceremony' | 'reception' = 'reception'): string {
  return (lang === 'sw' ? v.sw : v.en) || v.en || v.sw || (kind === 'ceremony' ? STR[lang].venueBlurbCeremony : STR[lang].venueBlurb);
}

/** A font size that keeps a line of names inside maxW at the given weight. */
export function fit(text: string, maxW: number, maxSize: number, o: { w?: number; upper?: boolean; min?: number } = {}): number {
  const w = o.w ?? 300;
  const f = o.upper ? 0.78 + ((w - 200) / 600) * 0.08 : 0.505 + ((w - 200) / 600) * 0.08;
  const len = Math.max(1, String(text || '').length);
  return Math.max(o.min ?? 28, Math.min(maxSize, Math.floor((maxW * 0.96) / (len * f))));
}

// ---------------------------------------------------------------------------
// Dates (always Dar es Salaam local, never the viewer's zone)
// ---------------------------------------------------------------------------

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
export function parseDate(s: string | undefined): { y: number; m: number; d: number } {
  const p = String(s || '2026-10-24').slice(0, 10).split('-').map(Number);
  return { y: p[0] || 2026, m: (p[1] || 1) - 1, d: p[2] || 1 };
}
export function fmtDate(s: string, lang: Lang) {
  const S = STR[lang];
  const { y, m, d } = parseDate(s);
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay();
  return {
    weekday: S.wd[dow] as string,
    day: String(d),
    month: S.mo[m] as string,
    year: String(y),
    long: `${d} ${S.mo[m]} ${y}`,
    dots: `${pad2(d)} · ${pad2(m + 1)} · ${y}`,
    short: `${pad2(d)}.${pad2(m + 1)}.${String(y).slice(2)}`,
  };
}
export function calendar(s: string, lang: Lang) {
  const S = STR[lang];
  const { y, m, d } = parseDate(s);
  const offset = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: { n: string; on: boolean }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ n: '', on: false });
  for (let dd = 1; dd <= days; dd++) cells.push({ n: String(dd), on: dd === d });
  while (cells.length % 7) cells.push({ n: '', on: false });
  return { head: S.wdHead, cells, rows: cells.length / 7 };
}
/** Milliseconds of the ceremony start, read as Dar es Salaam time (UTC+3). */
export function ceremonyStart(d: InviteDesign): number {
  const { y, m, d: day } = parseDate(d.date);
  const [hh, mm] = String(d.ceremony?.time || '10:00').split(':').map(Number);
  return Date.UTC(y, m, day, (hh || 0) - 3, mm || 0);
}
export function countdown(d: InviteDesign, now = Date.now()): [number, number, number, number] {
  const s = Math.floor(Math.max(0, ceremonyStart(d) - now) / 1000);
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}
export function city(addr: string | undefined): string {
  const p = String(addr || '').split(',');
  return (p[p.length - 1] ?? '').trim();
}

// ---------------------------------------------------------------------------
// Photos and crops
// ---------------------------------------------------------------------------

export function photo(d: InviteDesign, pid: string | undefined): Photo | null {
  if (pid === undefined) return null;
  return (d.photos || []).find((p) => p.id === pid) ?? null;
}
export function cropFor(d: InviteDesign, tplId: string, key: string): Crop {
  const c = d.crops || {};
  return c[`${tplId}:${key}`] ?? c[key] ?? { x: 50, y: 35, z: 1 };
}
export interface PhotoCss {
  img: string;
  size: string;
  pos: string;
  has: boolean;
  src: string | null;
}
/** background-size / position that crops photo `ph` into a sw:sh slot. */
export function photoCss(ph: Photo | null, crop: Crop | null, sw: number, sh: number): PhotoCss {
  if (ph === null) return { img: 'none', size: 'cover', pos: '50% 50%', has: false, src: null };
  const ia = (ph.w || 1) / (ph.h || 1);
  const sa = sw / sh;
  const z = crop?.z ?? 1;
  const W = 100 * z * Math.max(1, ia / sa);
  const H = 100 * z * Math.max(1, sa / ia);
  return {
    img: `url("${ph.src}")`,
    size: `${W.toFixed(2)}% ${H.toFixed(2)}%`,
    pos: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
    has: true,
    src: ph.src,
  };
}
export function slotCss(d: InviteDesign, tplId: string, slot: Slot): PhotoCss {
  return photoCss(photo(d, d.slots?.[slot.key]), cropFor(d, tplId, slot.key), slot.w, slot.h);
}

// ---------------------------------------------------------------------------
// Money, phones, links
// ---------------------------------------------------------------------------

export function tsh(n: number | undefined): string {
  return `TSh ${Math.round(n || 0).toLocaleString('en-US')}`;
}
function digits(p: string | undefined): string {
  return String(p || '').replace(/\D/g, '').replace(/^0/, '').replace(/^255/, '');
}
export function mapUrl(v: Venue): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name}, ${v.addr}`)}`;
}
export function telUrl(p: string): string {
  return `tel:+255${digits(p)}`;
}
export function waUrl(p: string, text?: string): string {
  return `https://wa.me/255${digits(p)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
export function cardNo(d: InviteDesign, g: Guest | null): string {
  return `${d.code}-${g ? g.id : '000'}`;
}
export function initials(name: string): string {
  return (name.trim()[0] ?? '').toUpperCase();
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_MUSIC: Music = { title: '', artist: '', link: '', on: true, auto: true, demo: false, file: null };

export const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  rsvp: true,
  song: true,
  countdown: true,
  quote: true,
  calendar: true,
  verse: true,
  ratiba: true,
  venues: true,
  dress: true,
  story: true,
  gallery: true,
  michango: true,
  kamati: true,
  notes: true,
  wishes: true,
};

/** Fill every field a stored design may lack, so views never null-check. */
export function normalise(input: Partial<InviteDesign> | null | undefined, fallback: Partial<InviteDesign> = {}): InviteDesign {
  const src = { ...fallback, ...(input ?? {}) };
  const blankVenue: Venue = { name: '', addr: '', time: '', photo: null, sw: '', en: '' };
  return {
    v: 1,
    tpl: byId[src.tpl ?? ''] ? (src.tpl as string) : 't03',
    lang: src.lang === 'en' ? 'en' : 'sw',
    faith: src.faith === 'nikah' || src.faith === 'civil' ? src.faith : 'church',
    code: src.code ?? '0000',
    names: { a: src.names?.a ?? '', b: src.names?.b ?? '' },
    date: (src.date ?? '').slice(0, 10) || '2026-12-31',
    ceremony: { ...blankVenue, ...(src.ceremony ?? {}) },
    reception: { ...blankVenue, ...(src.reception ?? {}) },
    rsvpBy: src.rsvpBy ?? '',
    ratiba: src.ratiba ?? [],
    dress: src.dress ?? [],
    attire: (src.attire ?? []).map((a) => ({ hex: a.hex, sw: a.sw ?? '', en: a.en ?? '', photo: a.photo ?? null })),
    story: src.story ?? [],
    notes: (src.notes ?? []).map((n) => ({ sw: n.sw ?? '', en: n.en ?? '', bodySw: n.bodySw ?? '', bodyEn: n.bodyEn ?? '' })),
    michango: { mpesa: '', tigo: '', airtel: '', name: '', ...(src.michango ?? {}) },
    kamati: src.kamati ?? [],
    words: { sw: src.words?.sw ?? {}, en: src.words?.en ?? {} },
    over: src.over ?? {},
    photos: src.photos ?? [],
    slots: src.slots ?? {},
    crops: src.crops ?? {},
    gallery: src.gallery ?? [],
    sections: { ...DEFAULT_SECTIONS, ...(src.sections ?? {}) },
    music: { ...DEFAULT_MUSIC, ...(src.music ?? {}) },
    pageOver: src.pageOver ?? {},
  };
}
