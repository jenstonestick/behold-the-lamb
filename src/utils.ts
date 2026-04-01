import type { ScriptureRef } from './types';

const BOOK_MAP: Record<string, string> = {
  "Gen":"ot/gen","Ex":"ot/ex","Lev":"ot/lev","Num":"ot/num","Deut":"ot/deut",
  "Josh":"ot/josh","Judg":"ot/judg","Ruth":"ot/ruth","1 Sam":"ot/1-sam","2 Sam":"ot/2-sam",
  "1 Kgs":"ot/1-kgs","2 Kgs":"ot/2-kgs","1 Chr":"ot/1-chr","2 Chr":"ot/2-chr",
  "Ezra":"ot/ezra","Neh":"ot/neh","Esth":"ot/esth","Job":"ot/job","Ps":"ot/ps",
  "Prov":"ot/prov","Eccl":"ot/eccl","Song":"ot/song","Isa":"ot/isa","Jer":"ot/jer",
  "Lam":"ot/lam","Ezek":"ot/ezek","Dan":"ot/dan","Hosea":"ot/hosea","Joel":"ot/joel",
  "Amos":"ot/amos","Obad":"ot/obad","Jonah":"ot/jonah","Micah":"ot/micah","Nahum":"ot/nahum",
  "Hab":"ot/hab","Zeph":"ot/zeph","Hag":"ot/hag","Zech":"ot/zech","Mal":"ot/mal",
  "Matt":"nt/matt","Mark":"nt/mark","Luke":"nt/luke","John":"nt/john","Acts":"nt/acts",
  "Rom":"nt/rom","1 Cor":"nt/1-cor","2 Cor":"nt/2-cor","Gal":"nt/gal","Eph":"nt/eph",
  "Philip":"nt/philip","Col":"nt/col","1 Thes":"nt/1-thes","2 Thes":"nt/2-thes",
  "1 Tim":"nt/1-tim","2 Tim":"nt/2-tim","Titus":"nt/titus","Philem":"nt/philem",
  "Heb":"nt/heb","James":"nt/james","1 Pet":"nt/1-pet","2 Pet":"nt/2-pet",
  "1 Jn":"nt/1-jn","2 Jn":"nt/2-jn","3 Jn":"nt/3-jn","Jude":"nt/jude","Rev":"nt/rev",
  "1 Ne":"bofm/1-ne","2 Ne":"bofm/2-ne","Jacob":"bofm/jacob","Enos":"bofm/enos",
  "Jarom":"bofm/jarom","Omni":"bofm/omni","W of M":"bofm/w-of-m","Mosiah":"bofm/mosiah",
  "Alma":"bofm/alma","Hel":"bofm/hel","3 Ne":"bofm/3-ne","4 Ne":"bofm/4-ne",
  "Morm":"bofm/morm","Ether":"bofm/ether","Moro":"bofm/moro",
  "D&C":"dc-testament/dc","Moses":"pgp/moses","Abr":"pgp/abr",
  "JS-H":"pgp/js-h","JS-M":"pgp/js-m","A of F":"pgp/a-of-f",
};

export function scrUrl(ref: ScriptureRef): string {
  const base = "https://www.churchofjesuschrist.org/study/scriptures/";
  const p = BOOK_MAP[ref.book] || ref.book;
  let url = `${base}${p}/${ref.ch}?lang=eng`;
  if (ref.vs) url += `#p${ref.vs}`;
  return url;
}

export function refLabel(ref: ScriptureRef): string {
  const { book, ch, vs, ve } = ref;
  if (ve) return `${book} ${ch}:${vs}\u2013${ve}`;
  if (vs) return `${book} ${ch}:${vs}`;
  return `${book} ${ch}`;
}

/**
 * Parse a free-text scripture reference like "Matt 27:27–44" or "1 Ne. 11:32–33"
 * into a churchofjesuschrist.org URL. Returns null if it can't parse.
 */
export function refStringToUrl(ref: string): string | null {
  const base = "https://www.churchofjesuschrist.org/study/scriptures/";
  // Normalize: remove trailing periods from abbreviations, normalize dashes
  const clean = ref.replace(/\./g, '').replace(/–/g, '-').trim();

  // Match pattern: "BookName Chapter:VerseStart-VerseEnd" or "BookName Chapter"
  const m = clean.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!m) return null;

  const bookRaw = m[1].trim();
  const ch = m[2];
  const vs = m[3];

  // Try to find book in BOOK_MAP (try with and without period normalization)
  const path = BOOK_MAP[bookRaw];
  if (!path) return null;

  let url = `${base}${path}/${ch}?lang=eng`;
  if (vs) url += `#p${vs}`;
  return url;
}

/* ── Easter date (Anonymous Gregorian algorithm) ── */
export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/* ── Schedule engine: maps position (0-indexed) → content week (1-50) ── */
export function computeSchedule(startDate: Date): number[] {
  const MS_DAY = 86400000;
  const planEnd = new Date(startDate.getTime() + 50 * 7 * MS_DAY);

  const weekOf = (d: Date) => Math.floor((d.getTime() - startDate.getTime()) / (7 * MS_DAY));

  // Find Easter in plan span
  let easterDate: Date | null = null;
  for (let y = startDate.getFullYear(); y <= planEnd.getFullYear(); y++) {
    const e = getEasterDate(y);
    if (e >= startDate && e < planEnd) { easterDate = e; break; }
  }

  // Find Christmas in plan span
  let christmasDate: Date | null = null;
  for (let y = startDate.getFullYear(); y <= planEnd.getFullYear(); y++) {
    const c = new Date(y, 11, 25);
    if (c >= startDate && c < planEnd) { christmasDate = c; break; }
  }

  const schedule: (number | null)[] = new Array(50).fill(null);
  const placed = new Set<number>();

  // Place Easter arc: content 10-13, so week 12 (Resurrection) lands on Easter
  if (easterDate) {
    const ep = weekOf(easterDate);
    const arc = [10, 11, 12, 13];
    const offsets = [-2, -1, 0, 1];
    for (let j = 0; j < 4; j++) {
      const pos = ep + offsets[j];
      if (pos >= 0 && pos < 50 && schedule[pos] === null) {
        schedule[pos] = arc[j];
        placed.add(arc[j]);
      }
    }
  }

  // Place Christmas arc: 48 (Glory), 49 (Birth), 50 (Messiah)
  if (christmasDate) {
    const cp = weekOf(christmasDate);
    // Place 49 on Christmas week
    if (cp >= 0 && cp < 50 && schedule[cp] === null) {
      schedule[cp] = 49; placed.add(49);
      // 48 before, 50 after
      if (cp > 0 && schedule[cp - 1] === null) { schedule[cp - 1] = 48; placed.add(48); }
      if (cp < 49 && schedule[cp + 1] === null) { schedule[cp + 1] = 50; placed.add(50); }
    }
  }

  // Fill remaining content weeks in order
  const remaining: number[] = [];
  for (let w = 1; w <= 50; w++) if (!placed.has(w)) remaining.push(w);

  let ri = 0;
  for (let i = 0; i < 50; i++) {
    if (schedule[i] === null) schedule[i] = remaining[ri++];
  }

  return schedule as number[];
}

/* ── Date range string for a position ── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function getWeekDates(pos: number, startDate: Date): string {
  const MS_DAY = 86400000;
  const ws = new Date(startDate.getTime() + (pos - 1) * 7 * MS_DAY);
  const we = new Date(ws.getTime() + 6 * MS_DAY);
  if (ws.getMonth() === we.getMonth()) {
    return `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}`;
  }
  return `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${MONTHS[we.getMonth()]} ${we.getDate()}`;
}

/* ── Build dynamic week metadata from schedule ── */
export interface DynWeekMeta {
  pos: number;         // position 1-50
  contentWeek: number; // which content week (1-50)
  dates: string;       // computed date range
  topic: string;       // topic from content week
}
export function buildWeeksMeta(schedule: number[], startDate: Date): DynWeekMeta[] {
  return schedule.map((cw, i) => ({
    pos: i + 1,
    contentWeek: cw,
    dates: getWeekDates(i + 1, startDate),
    topic: TOPIC_BY_WEEK[cw] || `Week ${cw}`,
  }));
}

export function getCurrent(startDate?: Date): { week: number; day: number } {
  const start = startDate || new Date(2026, 0, 18);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return { week: 1, day: 0 };
  const w = Math.floor(diffDays / 7);
  if (w >= 50) return { week: 50, day: 6 };
  return { week: w + 1, day: diffDays % 7 };
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ── Topic lookup by content week ── */
const TOPIC_BY_WEEK: Record<number, string> = {
  1:"Jesus Christ",2:"Advocate & Mediator",3:"Anointed, the",4:"Antemortal Existence",
  5:"Appearances, Antemortal",6:"Creator",7:"Foreordained & Firstborn",8:"Jehovah",
  9:"Mission of",10:"Betrayal & Trials",11:"Crucifixion & Death",12:"Resurrection & Ascension",
  13:"Atonement through",14:"Redeemer & Savior",15:"Deliverer",16:"Power of",
  17:"Glory of",18:"Light of the World & Rock",19:"Exemplar",20:"Teaching Mode",
  21:"Baptism of",22:"Temptation of",23:"Authority of",24:"Testimony of",
  25:"Judge",26:"King & Lord",27:"Lamb of God",28:"Messenger of the Covenant",
  29:"Son of God",30:"Son of Man",31:"Only Begotten Son",32:"Divine Sonship",
  33:"Relationship with the Father",34:"Spirit of",35:"Second Comforter",
  36:"Taking the Name of",37:"Head of the Church",38:"Family of",
  39:"Prophecies about",40:"Types in Anticipation",41:"Types in Memory",
  42:"Appearances, Postmortal",43:"Second Coming",44:"Millennial Reign",
  45:"Seed of",46:"Davidic Descent",47:"Good Shepherd",48:"Glory of",
  49:"Birth of",50:"Messiah",
};

export const WEEKS = [
  { week:1, dates:"Jan 18–24", topic:"Jesus Christ" },
  { week:2, dates:"Jan 25–31", topic:"Advocate & Mediator" },
  { week:3, dates:"Feb 1–7", topic:"Anointed, the" },
  { week:4, dates:"Feb 8–14", topic:"Antemortal Existence" },
  { week:5, dates:"Feb 15–21", topic:"Appearances, Antemortal" },
  { week:6, dates:"Feb 22–28", topic:"Creator" },
  { week:7, dates:"Mar 1–7", topic:"Foreordained & Firstborn" },
  { week:8, dates:"Mar 8–14", topic:"Jehovah" },
  { week:9, dates:"Mar 15–21", topic:"Mission of" },
  { week:10, dates:"Mar 22–28", topic:"Betrayal & Trials" },
  { week:11, dates:"Mar 29–Apr 4", topic:"Crucifixion & Death" },
  { week:12, dates:"Apr 5–11", topic:"Resurrection & Ascension" },
  { week:13, dates:"Apr 12–18", topic:"Atonement through" },
  { week:14, dates:"Apr 19–25", topic:"Redeemer & Savior" },
  { week:15, dates:"Apr 26–May 2", topic:"Deliverer" },
  { week:16, dates:"May 3–9", topic:"Power of" },
  { week:17, dates:"May 10–16", topic:"Glory of" },
  { week:18, dates:"May 17–23", topic:"Light of the World & Rock" },
  { week:19, dates:"May 24–30", topic:"Exemplar" },
  { week:20, dates:"May 31–Jun 6", topic:"Teaching Mode" },
  { week:21, dates:"Jun 7–13", topic:"Baptism of" },
  { week:22, dates:"Jun 14–20", topic:"Temptation of" },
  { week:23, dates:"Jun 21–27", topic:"Authority of" },
  { week:24, dates:"Jun 28–Jul 4", topic:"Testimony of" },
  { week:25, dates:"Jul 5–11", topic:"Judge" },
  { week:26, dates:"Jul 12–18", topic:"King & Lord" },
  { week:27, dates:"Jul 19–25", topic:"Lamb of God" },
  { week:28, dates:"Jul 26–Aug 1", topic:"Messenger of the Covenant" },
  { week:29, dates:"Aug 2–8", topic:"Son of God" },
  { week:30, dates:"Aug 9–15", topic:"Son of Man" },
  { week:31, dates:"Aug 16–22", topic:"Only Begotten Son" },
  { week:32, dates:"Aug 23–29", topic:"Divine Sonship" },
  { week:33, dates:"Aug 30–Sep 5", topic:"Relationship with the Father" },
  { week:34, dates:"Sep 6–12", topic:"Spirit of" },
  { week:35, dates:"Sep 13–19", topic:"Second Comforter" },
  { week:36, dates:"Sep 20–26", topic:"Taking the Name of" },
  { week:37, dates:"Sep 27–Oct 3", topic:"Head of the Church" },
  { week:38, dates:"Oct 4–10", topic:"Family of" },
  { week:39, dates:"Oct 11–17", topic:"Prophecies about" },
  { week:40, dates:"Oct 18–24", topic:"Types in Anticipation" },
  { week:41, dates:"Oct 25–31", topic:"Types in Memory" },
  { week:42, dates:"Nov 1–7", topic:"Appearances, Postmortal" },
  { week:43, dates:"Nov 8–14", topic:"Second Coming" },
  { week:44, dates:"Nov 15–21", topic:"Millennial Reign" },
  { week:45, dates:"Nov 22–28", topic:"Seed of" },
  { week:46, dates:"Nov 29–Dec 5", topic:"Davidic Descent" },
  { week:47, dates:"Dec 6–12", topic:"Good Shepherd" },
  { week:48, dates:"Dec 13–19", topic:"Glory of" },
  { week:49, dates:"Dec 20–26", topic:"Birth of" },
  { week:50, dates:"Dec 27–Jan 2", topic:"Messiah" },
];

export function mergeState(
  local: import('./types').AppState,
  remote: import('./types').AppState,
): import('./types').AppState {
  const done = { ...local.done };
  for (const [k, v] of Object.entries(remote.done ?? {})) {
    if (v) done[k] = true;
  }
  const bm = { ...local.bm };
  for (const [k, v] of Object.entries(remote.bm ?? {})) {
    if (v) bm[k] = true;
  }
  const notes = { ...local.notes };
  for (const [k, v] of Object.entries(remote.notes ?? {})) {
    if (v && (!notes[k] || v.length > notes[k].length)) notes[k] = v;
  }
  return { done, bm, notes };
}

const STATE_KEY = 'btl-state';

export function loadState(): Partial<import('./types').AppState> {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveState(state: import('./types').AppState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch { /* silently fail */ }
}
