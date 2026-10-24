import { describe, expect, it } from 'vitest';
import { mapEmbedUrl, mapQueryFromLink, venueMapQuery } from './map-embed';

const venue = { name: 'St. Joseph Cathedral', addr: 'Sokoine Drive, Dar es Salaam' };

describe('mapQueryFromLink (the copy of shared-types)', () => {
  it('takes the dropped pin from a place link, not the map centre', () => {
    expect(
      mapQueryFromLink(
        'https://www.google.com/maps/place/Mlimani+City/@-6.7735,39.2189,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-6.7727999!4d39.2201004',
      ),
    ).toBe('-6.7728,39.2201');
  });

  it('reads q, query and ll, the place name, then the centre', () => {
    expect(mapQueryFromLink('https://maps.google.com/?q=-6.8161,39.2803')).toBe('-6.8161,39.2803');
    expect(mapQueryFromLink('https://www.google.com/maps/search/?api=1&query=Serena+Hotel%2C+Dar')).toBe('Serena Hotel, Dar');
    expect(mapQueryFromLink('https://www.google.com/maps/place/Serena+Hotel+Dar/')).toBe('Serena Hotel Dar');
    expect(mapQueryFromLink('https://google.com/maps/@-6.80,39.28,15z')).toBe('-6.8,39.28');
  });

  it('knows nothing from a short link, another site or nonsense', () => {
    expect(mapQueryFromLink('https://maps.app.goo.gl/AbC123xYz')).toBeNull();
    expect(mapQueryFromLink('https://goo.gl/maps/AbC123')).toBeNull();
    expect(mapQueryFromLink('https://evil.example.com/maps/place/X')).toBeNull();
    expect(mapQueryFromLink('https://maps.google.com/?q=200,500')).toBeNull();
    expect(mapQueryFromLink('')).toBeNull();
  });
});

describe('venueMapQuery', () => {
  it('prefers what the API resolved, then the link, then the name and address', () => {
    expect(venueMapQuery({ ...venue, map: 'https://maps.app.goo.gl/AbC', mapQuery: '-6.8161,39.2903' })).toBe('-6.8161,39.2903');
    expect(venueMapQuery({ ...venue, map: 'https://maps.google.com/?q=-6.81,39.29' })).toBe('-6.81,39.29');
    // A short link the API could not follow: the place by name.
    expect(venueMapQuery({ ...venue, map: 'https://maps.app.goo.gl/AbC' })).toBe('St. Joseph Cathedral, Sokoine Drive, Dar es Salaam');
    expect(venueMapQuery({ name: 'Mlimani City', addr: '', map: '' })).toBe('Mlimani City');
  });

  it('is null for a venue with no place at all, so no map is drawn', () => {
    expect(venueMapQuery({ name: '', addr: '', map: '' })).toBeNull();
    expect(venueMapQuery({ name: ' ', addr: '', mapQuery: ' ' })).toBeNull();
  });
});

describe('mapEmbedUrl', () => {
  it('is the keyless Google embed in the page language, closer in on a pin', () => {
    expect(mapEmbedUrl('-6.8161,39.2903', 'sw')).toBe('https://www.google.com/maps?q=-6.8161%2C39.2903&hl=sw&z=16&output=embed');
    expect(mapEmbedUrl('St. Joseph Cathedral, Dar', 'en')).toBe(
      'https://www.google.com/maps?q=St.+Joseph+Cathedral%2C+Dar&hl=en&z=15&output=embed',
    );
  });
});
