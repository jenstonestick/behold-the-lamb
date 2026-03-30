export interface ScriptureRef {
  book: string;
  ch: number;
  vs?: number;
  ve?: number;
}

export interface Day {
  label: string;
  focus: string;
  scriptures: ScriptureRef[];
  nuances?: string;
  commentary: string;
  patterns: string;
  reflection: string;
}

export interface Synthesis {
  summary: string;
  connections: string[];
  teaching: string;
  commitment: string;
}

export interface WeekContent {
  title: string;
  subtitle: string;
  weekScriptures: string;
  synthesis: Synthesis;
  days: Day[];
}

export interface WeekMeta {
  week: number;
  dates: string;
  topic: string;
}

export interface AppState {
  done: Record<string, boolean>;
  bm: Record<string, boolean>;
  notes: Record<string, string>;
}
