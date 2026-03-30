#!/usr/bin/env node

/**
 * fetch-scriptures.mjs
 *
 * Reads all week-NN.ts content files, extracts ScriptureRef objects,
 * fetches chapter text from the Church API, and caches verse text
 * in src/content/scripture-text.json.
 *
 * Usage:  node scripts/fetch-scriptures.mjs
 * Requires: Node 18+ (uses built-in fetch)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUTPUT_FILE = join(CONTENT_DIR, 'scripture-text.json');

const API_BASE = 'https://www.churchofjesuschrist.org/study/api/v3/language-pages/type/content';
const DELAY_MS = 500;

// ── Book abbreviation → URL volume/book path ──────────────────────────

const BOOK_MAP = {
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

// ── Helpers ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract all ScriptureRef objects from a week file's text.
 * Matches patterns like:  {book:"John",ch:1,vs:1,ve:14}
 */
function extractRefs(fileText) {
  const refs = [];
  // Match scripture ref objects: {book:"...",ch:N,vs:N} or {book:"...",ch:N,vs:N,ve:N}
  const refRegex = /\{\s*book\s*:\s*"([^"]+)"\s*,\s*ch\s*:\s*(\d+)\s*,\s*vs\s*:\s*(\d+)(?:\s*,\s*ve\s*:\s*(\d+))?\s*\}/g;
  let m;
  while ((m = refRegex.exec(fileText)) !== null) {
    refs.push({
      book: m[1],
      ch: parseInt(m[2], 10),
      vs: parseInt(m[3], 10),
      ve: m[4] ? parseInt(m[4], 10) : undefined,
    });
  }
  return refs;
}

/**
 * Given a list of ScriptureRef objects, return a Set of unique
 * chapter keys like "ot/gen/1", "nt/matt/27".
 */
function uniqueChapters(refs) {
  const chapters = new Set();
  for (const ref of refs) {
    const path = BOOK_MAP[ref.book];
    if (!path) {
      console.warn(`  ⚠ Unknown book abbreviation: "${ref.book}"`);
      continue;
    }
    chapters.add(`${path}/${ref.ch}`);
  }
  return chapters;
}

/**
 * Strip HTML tags, study-note references, and clean up verse text.
 */
function cleanVerseText(html) {
  // Remove study-note anchor tags entirely (including their content — footnote markers)
  let text = html.replace(/<a[^>]*class="[^"]*study-note-ref[^"]*"[^>]*>.*?<\/a>/gi, '');

  // Handle clarity-word spans: keep text but wrap in [italics]
  text = text.replace(/<span[^>]*class="[^"]*clarity-word[^"]*"[^>]*>(.*?)<\/span>/gi, '[italics]$1[/italics]');

  // Remove verse number spans
  text = text.replace(/<span[^>]*class="[^"]*verse-number[^"]*"[^>]*>.*?<\/span>/gi, '');

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&nbsp;/g, ' ')
             .replace(/&#x?\d+;/g, '');

  // Collapse whitespace and trim
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Parse the API response HTML body and extract verse number → text map.
 */
function parseChapterBody(bodyHtml) {
  const verses = {};

  // Match <p> tags with id="p{num}" — these contain verses
  const pRegex = /<p[^>]*\bid="p(\d+)"[^>]*>(.*?)<\/p>/gis;
  let m;
  while ((m = pRegex.exec(bodyHtml)) !== null) {
    const verseNum = m[1];
    const innerHtml = m[2];
    const text = cleanVerseText(innerHtml);
    if (text) {
      verses[verseNum] = text;
    }
  }

  return verses;
}

/**
 * Fetch a single chapter from the Church API.
 */
async function fetchChapter(chapterKey) {
  const uri = `/scriptures/${chapterKey}`;
  const url = `${API_BASE}?lang=eng&uri=${encodeURIComponent(uri)}`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ScriptureStudyPlan/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${chapterKey}`);
  }

  const json = await res.json();

  // The body HTML is at content.body
  const bodyHtml = json?.content?.body;
  if (!bodyHtml) {
    throw new Error(`No content.body in response for ${chapterKey}`);
  }

  return parseChapterBody(bodyHtml);
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Scripture Text Fetcher ===\n');

  // 1. Read all week files
  const weekFiles = readdirSync(CONTENT_DIR)
    .filter(f => /^week-\d+\.ts$/.test(f))
    .sort();

  console.log(`Found ${weekFiles.length} week files.\n`);

  // 2. Extract all ScriptureRefs
  let allRefs = [];
  for (const file of weekFiles) {
    const filePath = join(CONTENT_DIR, file);
    const text = readFileSync(filePath, 'utf-8');
    const refs = extractRefs(text);
    allRefs = allRefs.concat(refs);
    console.log(`  ${file}: ${refs.length} references`);
  }

  console.log(`\nTotal references extracted: ${allRefs.length}`);

  // 3. Determine unique chapters
  const chapters = uniqueChapters(allRefs);
  console.log(`Unique chapters to fetch: ${chapters.size}\n`);

  // 4. Load existing cache if present (incremental)
  let cache = {};
  if (existsSync(OUTPUT_FILE)) {
    try {
      cache = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
      console.log(`Loaded existing cache with ${Object.keys(cache).length} chapters.\n`);
    } catch (e) {
      console.warn('Could not parse existing cache, starting fresh.\n');
      cache = {};
    }
  }

  // 5. Fetch each chapter
  const toFetch = [...chapters].filter(ch => !cache[ch]);
  console.log(`Chapters already cached: ${chapters.size - toFetch.length}`);
  console.log(`Chapters to fetch: ${toFetch.length}\n`);

  let fetched = 0;
  let failed = 0;

  for (const chapterKey of toFetch) {
    try {
      process.stdout.write(`[${fetched + failed + 1}/${toFetch.length}] Fetching ${chapterKey} ... `);
      const verses = await fetchChapter(chapterKey);
      const verseCount = Object.keys(verses).length;
      cache[chapterKey] = verses;
      console.log(`${verseCount} verses`);
      fetched++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    // Polite delay between requests
    if (fetched + failed < toFetch.length) {
      await sleep(DELAY_MS);
    }
  }

  // 6. Save cache
  // Sort keys for deterministic output
  const sorted = {};
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key];
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2), 'utf-8');

  console.log(`\n=== Done ===`);
  console.log(`Fetched: ${fetched} | Failed: ${failed} | Total cached: ${Object.keys(sorted).length}`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
