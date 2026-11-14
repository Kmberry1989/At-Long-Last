# Arcade Art Asset Catalog

This catalog tracks the art currently used by the Couple Arcade and the remaining art opportunities. Artwork is decorative: game state, card values, prompts, and accessible labels stay in application data.

## Current coverage

| Game | Current assets | Use |
| --- | --- | --- |
| Arcade menu | `public/assets/arcade/icons/our-arcade.png` and one cover for each game | Entry point and branded game selection |
| My One and Only! | `public/assets/arcade/my-one-and-only/{coral,plum,teal,gold,wild,back}.jpg` | Five card-face palettes plus one shared deck back; value labels remain live text |
| Catch My Heart | `public/assets/arcade/catch-my-heart/{card-back,suit-emblems}.webp` | Shared card back and four suit emblems; rank and suit values remain live text |
| Say Without Saying | Three 4×4 prompt sheets in `public/assets/arcade/say-without-saying/`; 48 prompt records | A matching visual cue for each prompt, selected from one of three sheets. Guessing presents four options to keep the play screen compact |
| Radar Love | `fleet-sprite.webp`, `sonar-hit.webp`, `sonar-miss.webp`, and `ship-sinking.webp` in `public/assets/arcade/radar-love/` | Placed ships, hit and miss feedback, and sinking flourish |
| Four Ever | `public/assets/connect-four/board.webp`, heart/crescent tokens, and three token atlases | Board surface and selectable player tokens |
| Our Little Pieces | Eight square scenes in `public/assets/arcade/our-little-pieces/` | Artwork for the 3D keepsake-box reveal and puzzle tiles. Three new scenes extend the shared-solve unlock path |

Our Little Pieces unlocks artwork at 0, 1, 3, 5, 7, 9, 11, and 14 shared solves. The 3D box is assembled from geometry in `JigsawUnboxing.jsx`; it does not need a separate rendered box image.

## Remaining opportunities

No active arcade game is missing its core gameplay artwork. These optional additions would deepen variety rather than fill a functional gap:

1. Additional charades prompt packs for more replay variety.
2. More token finishes for Four Ever, beyond the current selectable collection.
3. A seasonal puzzle-art collection for Our Little Pieces.

These are content expansions; the current art set covers each game's primary board, card, prompt, feedback, and key result states. Charades now has 48 prompts with four-choice guessing, and the puzzle collection contains eight scenes unlocked at 0, 1, 3, 5, 7, 9, 11, and 14 shared solves.
