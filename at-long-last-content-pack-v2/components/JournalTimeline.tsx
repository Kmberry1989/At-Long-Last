/**
 * JournalTimeline.tsx
 * At Long Last - Legacy timeline of saved moments
 * Drop into src/components/JournalTimeline.tsx
 */

type JournalEntry = {
  id: string;
  title: string;
  text: string;
  vibe: 'tender' | 'playful' | 'spicy';
  createdAt: string;
  image?: string; // dataUrl from doodle
  authorId?: string;
};

type Props = {
  entries: JournalEntry[];
  onSelect?: (entry: JournalEntry) => void;
};

const vibeStyles = {
  tender: 'bg-pink-100 border-pink-200 text-pink-900',
  playful: 'bg-yellow-100 border-yellow-200 text-yellow-900',
  spicy: 'bg-orange-100 border-orange-200 text-orange-900'
};

export function JournalTimeline({ entries, onSelect }: Props) {
  if (!entries.length) {
    return (
      <div className="w-full max-w-sm mx-auto p-8 bg-[#FFFBF6] rounded-[24px] border border-black/5 text-center">
        <p className="text-2xl mb-2">📖</p>
        <p className="font-medium">Your board is still clean</p>
        <p className="text-sm opacity-50 mt-1">Play a session and tap "Steal This Moment" to start your legacy</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">Your Long Last Legacy</h2>
      
      <div className="relative">
        {/* spine */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-black/10" />
        
        <div className="flex flex-col gap-6">
          {sorted.map(entry => (
            <div key={entry.id} className="relative flex gap-4 group">
              <div className={`w-6 h-6 rounded-full border-2 bg-white z-10 mt-1 flex items-center justify-center text-[10px]
                ${entry.vibe === 'tender' ? 'border-pink-300' : ''}
                ${entry.vibe === 'playful' ? 'border-yellow-400' : ''}
                ${entry.vibe === 'spicy' ? 'border-orange-400' : ''}
              `}>
                {entry.vibe === 'tender' ? '♥' : entry.vibe === 'playful' ? '✦' : '☾'}
              </div>
              
              <button
                onClick={() => onSelect?.(entry)}
                className={`flex-1 text-left p-4 rounded-[16px] border text-sm transition-transform active:scale-[0.98] ${vibeStyles[entry.vibe]}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="font-medium leading-tight">{entry.title}</p>
                  <p className="text-[10px] opacity-50 whitespace-nowrap">{new Date(entry.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="mt-2 leading-snug opacity-80 line-clamp-3">{entry.text}</p>
                {entry.image && (
                  <img src={entry.image} alt="doodle" className="mt-3 w-full rounded-[10px] border border-black/10 bg-white" />
                )}
                <p className="mt-2 text-[10px] tracking-widest opacity-40 uppercase">{entry.vibe} • saved</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example usage data for testing
export const EXAMPLE_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'Comfort Menu',
    text: 'When I am overwhelmed, what actually helps is you making tea and not trying to fix it, just sitting nearby.',
    vibe: 'tender',
    createdAt: new Date(Date.now() - 1000*60*60*24).toISOString()
  },
  {
    id: '2',
    title: 'Doodle Duel - Our Couch',
    text: 'Yours was more accurate but mine had the cat. We both lost.',
    vibe: 'playful',
    createdAt: new Date(Date.now() - 1000*60*60*5).toISOString()
  },
  {
    id: '3',
    title: 'Slow Morning',
    text: 'Wake up late, no phones, coffee on the balcony, you in that oversized sweater...',
    vibe: 'spicy',
    createdAt: new Date().toISOString()
  }
];
