import { DEFAULT_MUSIC, byId, normalise, type CardKind, type InviteDesign, type Lang } from './wcz';
import type { InviteGuestView } from './types';

/**
 * A made-up wedding for the per-template samples (/card-sample/:tpl) and
 * the render tests. Nothing here is private, and it has no photos on
 * purpose: generic cards and many weddings ship with `photos: []`, so every
 * template must look right with its slots empty.
 */
export function sampleDesign(tpl: string, lang: Lang = 'sw'): InviteDesign {
  return normalise({
    tpl: byId[tpl] ? tpl : 't01',
    lang,
    faith: 'church',
    code: '1549',
    names: { a: 'Amina', b: 'Juma' },
    date: '2026-12-05',
    ceremony: { name: "St Joseph's Cathedral", addr: 'Sokoine Drive, Dar es Salaam', time: '10:00' },
    reception: { name: 'Golden Tulip Hotel', addr: 'Msasani Peninsula, Dar es Salaam', time: '18:00' },
    rsvpBy: '2026-11-20',
    ratiba: [
      { t: '10:00', icon: 'Favorite', sw: 'Ibada ya ndoa', en: 'Wedding service', place: "St Joseph's Cathedral" },
      { t: '13:00', icon: 'PhotoCamera', sw: 'Picha', en: 'Photos' },
      { t: '18:00', icon: 'Restaurant', sw: 'Chakula cha jioni', en: 'Dinner', place: 'Golden Tulip Hotel' },
      { t: '20:00', icon: 'Cake', sw: 'Keki', en: 'Cake' },
      { t: '21:00', icon: 'MusicNote', sw: 'Dansi', en: 'Dancing' },
    ],
    dress: ['#1F2A44', '#DCAE96', '#D4AF37'],
    story: [
      { y: '2019', sw: 'Tulikutana Mwanza', en: 'We met in Mwanza' },
      { y: '2024', sw: 'Uchumba', en: 'Engaged' },
    ],
    michango: { mpesa: '0754 000 000', tigo: '', airtel: '', name: 'Amina & Juma' },
    kamati: [{ name: 'Mama Asha', sw: 'Mwenyekiti', en: 'Chair', phone: '0754 000 001' }],
    music: { ...DEFAULT_MUSIC, title: 'Perfect', artist: 'Ed Sheeran', on: false },
    photos: [],
  });
}

/** The sample guest: a party of two, so the default kind would be double. */
export function sampleGuest(kind: CardKind): InviteGuestView {
  return {
    id: '001',
    name: 'Bibi Rehema Mwakyusa',
    seats: 2,
    kind,
    rsvp: 'pending',
    coming: null,
    pledge: 0,
    paid: 0,
    cardNumber: '1549-001',
    generic: null,
  };
}

/** `?kind=double` on a sample URL; anything else is single. */
export function kindParam(value: string | null | undefined): CardKind {
  return value === 'double' ? 'double' : 'single';
}
