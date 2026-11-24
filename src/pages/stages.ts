import { Video, BookOpen, Dumbbell, FlaskConical, ClipboardCheck, Wrench, RefreshCw, type LucideIcon } from 'lucide-react';

export type StageKey = 'watch' | 'read' | 'practice' | 'simulate' | 'quiz' | 'apply' | 'review';

/** The seven learning stages every unit follows (labels live in src/translations). */
export const STAGES: { key: StageKey; Icon: LucideIcon }[] = [
  { key: 'watch', Icon: Video },
  { key: 'read', Icon: BookOpen },
  { key: 'practice', Icon: Dumbbell },
  { key: 'simulate', Icon: FlaskConical },
  { key: 'quiz', Icon: ClipboardCheck },
  { key: 'apply', Icon: Wrench },
  { key: 'review', Icon: RefreshCw },
];
