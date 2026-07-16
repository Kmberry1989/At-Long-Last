/**
 * sessionWiring.ts
 * Drop into src/features/session/sessionWiring.ts or merge into your existing session helpers
 */

import { ACTIVITIES, type Activity, type Vibe } from './activityRegistry';
import { DUELS, type Duel } from './duelRegistry';

export type VibeWeights = { tender: number; playful: number; spicy: number };

export function weightedPick<T extends { vibe: Vibe }>(items: T[], weights: VibeWeights, allowIntensity: number[] = [1,2]): T {
  const filtered = items.filter((i: any) => allowIntensity.includes(i.intensity));
  const pool = filtered.length ? filtered : items;
  
  const scored = pool.map(item => {
    const w = weights[item.vibe] || 0.1;
    return { item, score: w * (0.8 + Math.random() * 0.4) }; // add jitter
  });
  
  scored.sort((a,b) => b.score - a.score);
  // pick from top 40% for variety
  const top = scored.slice(0, Math.max(3, Math.floor(scored.length * 0.4)));
  return top[Math.floor(Math.random() * top.length)].item;
}

export function buildSessionQueue(weights: VibeWeights, length = 7) {
  const queue: (Activity | Duel)[] = [];
  const intensityCap = weights.spicy > 0.5 ? [1,2,3] : [1,2]; // unlock intensity 3 only if spicy is high
  
  // Flow: warmup playful -> tender -> mix -> spicy if wanted -> close tender
  const flow: Vibe[] = [
    'playful', 'tender', 'playful', 'tender', 
    weights.spicy > 0.3 ? 'spicy' : 'playful',
    'tender',
    'tender'
  ];

  for (let i = 0; i < length; i++) {
    const desiredVibe = flow[i] || 'tender';
    // bias weights toward desired vibe for this step
    const stepWeights = { ...weights, [desiredVibe]: weights[desiredVibe] + 0.3 };
    const total = stepWeights.tender + stepWeights.playful + stepWeights.spicy;
    const norm = {
      tender: stepWeights.tender / total,
      playful: stepWeights.playful / total,
      spicy: stepWeights.spicy / total
    };

    // Alternate duel / activity / duel / activity
    const isDuel = i % 2 === 1;
    const pool = isDuel ? DUELS : ACTIVITIES;
    const pick = weightedPick(pool as any, norm, intensityCap as any) as any;
    
    // avoid duplicates
    if (queue.find(q => q.id === pick.id)) {
      i--;
      continue;
    }
    queue.push(pick);
  }

  return queue;
}

// Example Firestore session doc shape
export interface SessionDoc {
  coupleId: string;
  createdAt: any; // serverTimestamp
  vibeWeights: VibeWeights;
  queue: Array<{ id: string; type: 'activity' | 'duel'; vibe: Vibe }>;
  currentIndex: number;
  completedIds: string[];
  status: 'lobby' | 'playing' | 'finished';
}

// Helper to save a journal entry
export function makeJournalEntry(activity: Activity, response: { text: string; extra?: any }, coupleId: string, authorId: string) {
  return {
    coupleId,
    activityId: activity.id,
    vibe: activity.vibe,
    title: activity.title,
    text: response.text,
    extra: response.extra || null,
    authorId,
    createdAt: new Date().toISOString(),
    openAt: activity.id === 'postcard-next-year' ? new Date(Date.now() + 365*24*60*60*1000).toISOString() : null
  };
}
