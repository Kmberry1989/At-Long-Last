# Board theme layout — 2026-10-31

## Shared scene rules

The board is one tabletop scene, not five unrelated levels. The track is an ellipse around the inner mat. In world coordinates, **+Z is closest to the viewer**, −Z is the far edge, and X moves left/right. The inner mat is roughly X ±8.5, Z ±6.1. Props belong inside that mat, away from the tile track and draggable token route. They are low enough to keep the players, dice, cards, and current landing readable. Every grounded prop and airborne object should cast a soft shadow onto the mat or board.

The existing five authored GLBs in each base theme are sufficient for this scene pass. Shared outer anchors keep the silhouette familiar while some themes pair related objects into small vignettes. The center of the mat stays open for dice, cards, and camera moves. Coordinates below are X/Z; the butterfly also floats at Y 1.1. These positions are rendered by `boardThemes.js` and `BoardScene.jsx`.

| Theme | Prop arrangement using existing GLBs | Open play area and camera read | Backdrop and quiet motion |
| --- | --- | --- | --- | --- |
| **Cozy night in** | Slippers (−6.4, −3.8) and blankets (−5.1, +3.2) define the left soft corner. Latte (+6.4, −3.6) and record player (+5.2, +3.4) define the right corner. Lamp (0, +5.5) warms the foreground. | Keep the record player and lamp below the answer-card lift; the middle remains a clean velvet stage. | Plum dusk, floating dust, a soft lamp pulse. Keep the record player static until its platter can be animated separately. |
| **Secret garden** | Rose planter (−6.4, −3.8) and floating butterfly (−5.25, −2.5) make one garden cluster. Bench (+6.4, −3.6) gives it a destination; watering can (−5.1, +3.2) and songbird (0, +5.5) sit closer to the viewer. | Leave the right foreground open so the butterfly does not cross dice or answer cards. | Blue-green twilight with a mauve horizon, slow fireflies, butterfly bob, slight songbird turn. |
| **Seaside date** | Surfboard rack (−6.4, −3.8) and sandcastle (+6.4, −3.6) frame the shore. Picnic basket (−5.1, +3.2) balances a fire pit (+5.2, +3.4) and nearby deck chair (+2.65, +4.65). | The chair faces inward but stays clear of the foreground route; the middle is open for the roll. | Sunset gradient, light sea haze, subtle spray motes and firelight flicker. |
| **City date night** | Dessert (−6.4, −3.8) and heart coffee (−4.1, −3.2) make one café table. Bouquet (+2.5, +2.65) sits near the flower cart (+5.2, +3.4). Taxi (0, +5.5) connects the two vignettes. | Avoid a central skyline or tall prop that would hide the dice. | Violet city dusk, small warm light motes and cart glow. A distant skyline silhouette is optional after camera testing. |
| **Holiday sparkle** | Cocoa mug (−6.4, −3.8) and cocoa jar (−4.15, −3.25) sit together. Twinkle lights (−5.1, +3.2) and wreath (+5.2, +3.4) frame a wrapped gift (0, +5.5). | Gift remains a foreground story cue without covering the tile beneath it. | Cool blue-gray sky, slow soft snow and a restrained warm twinkle on the lights. Keep snow sparse over the answer UI. |

The unlockable themes reuse the correct base props and layout, changing light and sky instead of loading duplicate models:

| Remix | Base props | Sky and motion |
| --- | --- | --- |
| Starlit Rooftop | City | Deep blue sky, small twinkling stars, warm cart light. |
| Autumn Embers | Garden | Amber horizon and slowly falling leaf-colored motes. |
| Cherry Blossom | Garden | Pink twilight and drifting petal-colored motes. |
| Aurora Veil | Beach | Teal night sky with a moving aurora band and cool motes. |

## Shot order and interaction

1. **Establish:** Show the whole board briefly, including the theme's silhouette and both player pieces. Avoid putting a hero prop over the route.
2. **Roll:** Move the camera close to two darker dice in the open inner mat. The dice respond to rub/rattle input, then cast toward the board. The current one-die animation remains unfinished.
3. **Travel:** Follow the dragged piece along the inlaid route, with a short lift/plop at each tile. Persist the landing only after travel completes. This state model remains unfinished.
4. **Landing:** Pan to the landed tile and lift a card or activity above it. The theme props stay in the periphery; they do not compete with answer controls. Keep both player portraits visible.
5. **Return:** Pull back just enough to show the next player and neighboring route, then resume the board. Do not show Home, scrapbook, or settings over active play.

## New-asset threshold

The current five GLBs per theme cover the playable mat. If a later camera shot exposes an empty horizon, the most useful new props would be a cozy window silhouette, a garden arch, a distant beach sailboat, a city skyline, and a holiday tree line. These are optional backdrop silhouettes outside the playable route, behind the tile track; they should cast onto their own ground only, so they do not darken the board. The user can supply these models when the camera shots are settled.

## Current implementation and proof boundary

`boardThemes.js` now defines a sky palette and particle mode for every base and unlockable theme. `boardEnvironment.js` makes a procedural sky dome with slow haze/stars/aurora and soft ambient particles. Selected existing props carry subtle light or motion. The five prop layouts above reflect the current model coordinates; the detailed pan/zoom camera shots and tactile dice/piece travel are **planned, not implemented**. Inspect mobile and desktop gameplay and actual touch performance before treating this as final art direction. No new GLB assets were created.
