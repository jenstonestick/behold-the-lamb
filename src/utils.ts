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

export function getCurrent(): { week: number; day: number } {
  const start = new Date(2026, 0, 18); // Jan 18, 2026
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return { week: 1, day: 0 };
  const w = Math.floor(diffDays / 7);
  if (w >= 50) return { week: 50, day: 6 };
  return { week: w + 1, day: diffDays % 7 };
}

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
