import type { LucideIcon } from 'lucide-react';
import { withAlpha } from '@/components/color';

/** Standard wrapper every Module 2 simulation sits in: coloured header "pass" + body + controls. */
export function FoodShell({ title, subtitle, accent, Icon, children, controls }: {
  title: string; subtitle?: string; accent: string; Icon: LucideIcon;
  children: React.ReactNode; controls?: React.ReactNode;
}) {
  return (
    <section className="sim-shell" style={{ borderColor: withAlpha(accent, 0.3) }}>
      <header className="px-4 sm:px-5 py-3.5 border-b flex items-start gap-3.5" style={{ borderColor: withAlpha(accent, 0.2), background: `linear-gradient(90deg, ${withAlpha(accent, 0.14)}, transparent 80%)` }}>
        <span className="grid place-items-center w-12 h-12 rounded-2xl flex-shrink-0 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${accent}, ${withAlpha(accent, 0.7)})` }}>
          <Icon size={24} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base sm:text-lg leading-tight" style={{ color: accent }}>{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-600 dark:text-cream-300/80 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </header>
      <div className="p-4 sm:p-5 space-y-5">
        {children}
        {controls && <div className="space-y-3 pt-1">{controls}</div>}
      </div>
    </section>
  );
}
