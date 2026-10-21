import { ceremonyStart, type InviteDesign } from './wcz';

function stamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Add-to-calendar links for a page that has none from the API (the public
 * story page). The invitation page uses the API's own links, which carry the
 * reminders; these are the plain fallback.
 */
export function calendarLinks(d: InviteDesign, siteUrl: string): { googleUrl: string; icsUrl: string } {
  const start = ceremonyStart(d);
  const end = start + 6 * 60 * 60 * 1000;
  const title = `${d.names.a} & ${d.names.b}`;
  const where = [d.ceremony.name, d.ceremony.addr].filter(Boolean).join(', ');
  const googleUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${stamp(start)}/${stamp(end)}` +
    `&location=${encodeURIComponent(where)}` +
    `&details=${encodeURIComponent(siteUrl)}`;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding.co.tz//Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${d.code}-${d.date}@wedding.co.tz`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${where}`,
    `URL:${siteUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return { googleUrl, icsUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}` };
}
