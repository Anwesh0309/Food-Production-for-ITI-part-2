/** Bilingual string: every piece of learner-facing content carries English and Hindi. */
export interface Bi { en: string; hi: string }
export interface Mcq2 { q: Bi; options: Bi[]; correct: number; explanation: Bi }
export interface Scenario2 { q: Bi; options: Bi[]; correct: number; why: Bi; scene: string }
export interface WatchStep { icon: string; title: Bi; text: Bi }
export interface Unit2 {
  id: number; section: Bi; themeKey: string; simId: string; title: Bi; desc: Bi; syllabus: Bi;
  objectives: Bi[]; keyTopics: Bi[]; watch: WatchStep[]; theory: Bi;
  terminology: { term: Bi; def: Bi }[]; practice: Bi[]; mcqs: Mcq2[]; scenarios: Scenario2[];
  review: Bi; safety: Bi[]; applications: Bi[]; formulas?: { name: Bi; formula: string; desc: Bi }[];
}
export const b = (en: string, hi: string): Bi => ({ en, hi });
