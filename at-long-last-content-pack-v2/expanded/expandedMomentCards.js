// expandedMomentCards.js — 12 new moment cards WITH ART, Hand in Crowd v2 (Trash 12 → 18, Treasure 12 → 18)
// At Long Last — Expanded Edition + Art (Nov 26, 2026)
// ADDITIVE ONLY. Drop-in replacement for the previous expandedMomentCards.js.
// Existing 24 cards are untouched. New cards add `image` only.

export const NEW_TRASH_CARDS = [
  { id: "trash-dead-phone", kind: "trash", title: "The Dead Phone", description: "The phone dies mid-directions.", ritual: "Charge and carry on", image: "/assets/moment-cards/trash-dead-phone.webp" },
  { id: "trash-spilled-snack", kind: "trash", title: "The Spilled Snack", description: "The snack spills on the way to the couch.", ritual: "Scoop and share", image: "/assets/moment-cards/trash-spilled-snack.webp" },
  { id: "trash-loud-neighbor", kind: "trash", title: "The Loud Neighbor", description: "The neighbor's music is louder than your conversation.", ritual: "Turn up the laughter", image: "/assets/moment-cards/trash-loud-neighbor.webp" },
  { id: "trash-forgotten-password", kind: "trash", title: "The Forgotten Password", description: "You can't log in and the reset email won't come.", ritual: "Reset together", image: "/assets/moment-cards/trash-forgotten-password.webp" },
  { id: "trash-soggy-walk", kind: "trash", title: "The Soggy Walk", description: "The walk gets rained on and you're both soaked.", ritual: "Shake it off", image: "/assets/moment-cards/trash-soggy-walk.webp" },
  { id: "trash-burnt-toast", kind: "trash", title: "The Burnt Toast", description: "Breakfast burns and the kitchen smells like smoke.", ritual: "Open a window, start again", image: "/assets/moment-cards/trash-burnt-toast.webp" },
];

export const NEW_TREASURE_CARDS = [
  { id: "treasure-shared-umbrella", kind: "treasure", title: "The Shared Umbrella", description: "One umbrella, two people, very close together.", ritual: "A little closer", image: "/assets/moment-cards/treasure-shared-umbrella.webp" },
  { id: "treasure-good-morning-text", kind: "treasure", title: "The Good Morning Text", description: "A text that says \u201cthinking of you\u201d before you've woken up.", ritual: "A morning glow", image: "/assets/moment-cards/treasure-good-morning-text.webp" },
  { id: "treasure-grocery-laugh", kind: "treasure", title: "The Laugh in the Grocery Aisle", description: "A laugh that makes strangers smile.", ritual: "A public joy", image: "/assets/moment-cards/treasure-grocery-laugh.webp" },
  { id: "treasure-found-photo", kind: "treasure", title: "The Found Photo", description: "A photo you forgot you took that makes you both laugh.", ritual: "A found treasure", image: "/assets/moment-cards/treasure-found-photo.webp" },
  { id: "treasure-quiet-drive", kind: "treasure", title: "The Quiet Drive", description: "A drive with no talking, just music and being together.", ritual: "A quiet road", image: "/assets/moment-cards/treasure-quiet-drive.webp" },
  { id: "treasure-hand-in-crowd", kind: "treasure", title: "The Hand Held in a Crowd", description: "A hand that finds yours without looking.", ritual: "A found hand", image: "/assets/moment-cards/treasure-hand-in-crowd.webp" },
];

export const NEW_MOMENT_CARDS = [...NEW_TRASH_CARDS, ...NEW_TREASURE_CARDS];
export function mergeMomentCards(baseCards) {
  const ids = new Set(baseCards.map((c) => c.id));
  return [...baseCards, ...NEW_MOMENT_CARDS.filter((c) => !ids.has(c.id))];
}
