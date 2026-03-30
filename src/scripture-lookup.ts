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

// Lazy-loaded scripture cache
let cache: Record<string, Record<string, string>> | null = null;

async function getCache(): Promise<Record<string, Record<string, string>>> {
  if (cache) return cache;
  try {
    const mod = await import('./content/scripture-text.json');
    cache = mod.default as Record<string, Record<string, string>>;
  } catch {
    cache = {};
  }
  return cache;
}

export interface VerseEntry {
  num: number;
  text: string;
}

export async function getVerses(ref: ScriptureRef): Promise<VerseEntry[]> {
  const c = await getCache();
  const path = BOOK_MAP[ref.book];
  if (!path) return [];
  const chKey = `${path}/${ref.ch}`;
  const chapter = c[chKey];
  if (!chapter) return [];

  const vs = ref.vs ?? 1;
  const ve = ref.ve ?? (ref.vs ? ref.vs : Math.max(...Object.keys(chapter).map(Number)));

  const result: VerseEntry[] = [];
  for (let v = vs; v <= ve; v++) {
    const text = chapter[String(v)];
    if (text) result.push({ num: v, text });
  }
  return result;
}
