import fetch from 'node-fetch';
import ICAL from 'ical.js';

const CLASS_URL = 'https://celcat.rambouillet.iut-velizy.uvsq.fr/cal/ical/G1-VW2KSGLE5961/schedule.ics'; // INF1-B2
const TARGET = new Date('2025-09-22T00:00:00'); // Lundi 22/09/2025

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }

const SOD = startOfDay(TARGET);
const EOD = endOfDay(TARGET);

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && aEnd >= bStart;
}

function formatTime(d) {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

try {
  const res = await fetch(CLASS_URL, { headers: { 'Accept': 'text/calendar,text/plain,*/*' }});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  let icsText = new TextDecoder('utf-8').decode(buf).replace(/^\uFEFF/, '');
  if (/Ã|�/.test(icsText) && !/[\u0100-\uFFFF]/.test(icsText)) {
    icsText = new TextDecoder('latin1').decode(buf);
  }
  const jcal = ICAL.parse(icsText);
  const vcal = new ICAL.Component(jcal);
  const vevents = vcal.getAllSubcomponents('vevent');

  const result = [];
  const sodICAL = ICAL.Time.fromJSDate(SOD);
  const eodICAL = ICAL.Time.fromJSDate(EOD);

  for (const comp of vevents) {
    const evt = new ICAL.Event(comp);
    const summary = comp.getFirstPropertyValue('summary') || 'Cours';
    const location = comp.getFirstPropertyValue('location') || '';
    const description = comp.getFirstPropertyValue('description') || '';

    if (evt.isRecurring()) {
      const it = evt.iterator(sodICAL);
      let next;
      while ((next = it.next())) {
        if (next.compare(eodICAL) > 0) break; // après la journée
        const occ = evt.getOccurrenceDetails(next);
        const s = occ.startDate.toJSDate();
        const e = occ.endDate.toJSDate();
        if (overlaps(s, e, SOD, EOD)) {
          result.push({ title: summary, location, description, start: s, end: e });
        }
      }
    } else {
      const ds = comp.getFirstPropertyValue('dtstart');
      const de = comp.getFirstPropertyValue('dtend');
      if (!ds || !de) continue;
      const s = ds.toJSDate();
      const e = de.toJSDate();
      if (overlaps(s, e, SOD, EOD)) {
        result.push({ title: summary, location, description, start: s, end: e });
      }
    }
  }

  result.sort((a,b) => a.start - b.start);

  if (result.length === 0) {
    console.log('Aucun cours trouvé pour INF1-B2 le 22/09/2025');
  } else {
    console.log(`Cours INF1-B2 du lundi 22/09/2025 (${result.length}) :`);
    for (const ev of result) {
      console.log(`- ${formatTime(ev.start)} – ${formatTime(ev.end)} | ${ev.title}${ev.location ? ' @ '+ev.location : ''}`);
      if (ev.description) {
        const d = ev.description.replace(/\s+/g, ' ').trim();
        if (d) console.log(`  desc: ${d}`);
      }
    }
  }
} catch (err) {
  console.error('Erreur:', err.message);
  process.exit(1);
}
