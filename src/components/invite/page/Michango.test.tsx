import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalise, theme, type Lang } from '@/lib/invite/wcz';
import type { InviteGuestView } from '@/lib/invite/types';
import { PalContext, palette } from './palette';
import { Michango, PayMethodChoice } from './Michango';

const d = normalise({});
const pal = palette(theme(d, d.tpl));

const guest: InviteGuestView = {
  id: 'g1',
  name: 'Neema Mushi',
  seats: 1,
  rsvp: 'yes',
  coming: 1,
  pledge: 200_000,
  paid: 50_000,
  cardNumber: '0468-001',
  generic: null,
};

function render(props: { lang?: Lang; token?: string | null; paymentMethods?: string[] }): string {
  return renderToStaticMarkup(
    <PalContext.Provider value={pal}>
      <Michango
        d={d}
        lang={props.lang ?? 'sw'}
        token={props.token === undefined ? 'tok' : props.token}
        guest={guest}
        accounts={[]}
        paymentMethods={props.paymentMethods}
      />
    </PalContext.Provider>,
  );
}

describe('Michango: paying by card', () => {
  it('says mobile money or card under the pay button when card is offered', () => {
    expect(render({ lang: 'sw', paymentMethods: ['mobile_money', 'card'] })).toContain('Pesa ya simu au kadi');
    expect(render({ lang: 'en', paymentMethods: ['mobile_money', 'card'] })).toContain('Mobile money or card');
  });

  it('changes nothing while card is off', () => {
    const off = render({ lang: 'en', paymentMethods: ['mobile_money'] });
    expect(off).toBe(render({ lang: 'en' }));
    expect(off).toContain('Contribute now');
    expect(off).not.toMatch(/card/i);
  });

  it('shows no pay button and no card line on the story page', () => {
    const html = render({ lang: 'en', token: null, paymentMethods: ['mobile_money', 'card'] });
    expect(html).not.toContain('Contribute now');
    expect(html).not.toContain('Mobile money or card');
  });
});

describe('PayMethodChoice', () => {
  function choice(lang: Lang, value: 'mobile_money' | 'card'): string {
    return renderToStaticMarkup(
      <PalContext.Provider value={pal}>
        <PayMethodChoice lang={lang} options={['mobile_money', 'card']} value={value} onChange={() => undefined} />
      </PalContext.Provider>,
    );
  }

  it('offers both, named in the guest language', () => {
    expect(choice('sw', 'mobile_money')).toContain('Pesa ya simu');
    expect(choice('sw', 'mobile_money')).toContain('Kadi');
    expect(choice('en', 'mobile_money')).toContain('Mobile money');
    expect(choice('en', 'mobile_money')).toContain('Card');
  });

  it('marks the chosen one pressed and fills it in the accent', () => {
    const html = choice('en', 'card');
    const buttons = html.match(/<button[^>]*>[^<]*<\/button>/g) ?? [];
    expect(buttons).toHaveLength(2);
    const [mobile, card] = buttons as [string, string];
    expect(mobile).toContain('aria-pressed="false"');
    expect(card).toContain('aria-pressed="true"');
    expect(card).toContain('Card');
    expect(card.toLowerCase()).toContain(`background:${pal.accent.toLowerCase()}`);
    expect(mobile).toContain('background:transparent');
  });

  it('draws nothing when there is only one way to pay', () => {
    const html = renderToStaticMarkup(
      <PalContext.Provider value={pal}>
        <PayMethodChoice lang="en" options={['mobile_money']} value="mobile_money" onChange={() => undefined} />
      </PalContext.Provider>,
    );
    expect(html).toBe('');
  });
});
