import type { Tab } from '../types';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'log', label: 'Log', icon: 'M12 4v16m8-8H4' },
  { id: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'progress', label: 'Progress', icon: 'M3 13h2l3-8 4 16 3-8h2' },
];

export function Navigation({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 bg-surface border-t border-border flex">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            active === t.id ? 'text-accent' : 'text-text-muted'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
          </svg>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
