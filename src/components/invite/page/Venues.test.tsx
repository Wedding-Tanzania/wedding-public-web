import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalise, theme } from '@/lib/invite/wcz';
import { PalContext, palette } from './palette';
import { Venues } from './Venues';

function render(items: Parameters<typeof Venues>[0]['items'], lang: 'sw' | 'en' = 'sw'): string {
  const d = normalise({});
  return renderToStaticMarkup(
    <PalContext.Provider value={palette(theme(d, d.tpl))}>
      <Venues items={items} lang={lang} />
    </PalContext.Provider>,
  );
}

describe('Venues: the embedded map', () => {
  it('draws a lazy, titled Google map per venue that has a place, beside the map button', () => {
    const html = render([
      { label: 'Kanisa', kind: 'ceremony', v: { name: 'St. Joseph Cathedral', addr: 'Sokoine Drive', time: '10:00', map: 'https://maps.app.goo.gl/AbC', mapQuery: '-6.8161,39.2903' } },
      { label: 'Ukumbi', kind: 'reception', v: { name: 'Mlimani City Hall', addr: 'Sam Nujoma Road', time: '18:30', map: '' } },
    ]);
    const frames = html.match(/<iframe[^>]*>/g) ?? [];
    expect(frames).toHaveLength(2);
    expect(frames[0]).toContain('src="https://www.google.com/maps?q=-6.8161%2C39.2903&amp;hl=sw&amp;z=16&amp;output=embed"');
    expect(frames[0]).toContain('loading="lazy"');
    expect(frames[0]).toContain('title="Ramani ya kanisa: St. Joseph Cathedral"');
    expect(frames[1]).toContain('q=Mlimani+City+Hall%2C+Sam+Nujoma+Road');
    // The open-in-Maps button stays: the couple's exact link, else a search.
    expect(html).toContain('href="https://maps.app.goo.gl/AbC"');
    expect(html).toContain('data-map-link="1"');
  });

  it('draws no map for a venue with no place', () => {
    expect(render([{ label: 'Ceremony', kind: 'ceremony', v: { name: '', addr: '', time: '' } }], 'en')).not.toContain('<iframe');
  });
});
