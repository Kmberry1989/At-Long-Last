# At Long Last board-display prompts

These are concept prompts for generating image references that can be modeled into decorative GLB assets. They are intended for the open middle of the board: attractive, readable at a distance, and deliberately non-functional.

## Shared reference block

Append this to each prompt:

> Create a polished 3D game-asset reference render for a romantic two-player tabletop board game. One decorative centerpiece only, centered on a small unobtrusive circular or softly beveled base, sized to fit inside roughly 1.5 board tiles and no taller than 1.5 tile widths. Use a 3/4 orthographic camera, plus enough visible front and side geometry to support later modeling. Stylized premium 3D, tactile materials, soft studio lighting, gentle shadows, warm intimate mood, clean silhouette, production-friendly shapes, medium detail, no tiny fragile parts. Transparent background or neutral warm-gray studio background. No people, no hands, no text, no logos, no UI, no dice, no cards, no buttons, no gameplay function.

## Centerpiece prompts

### 1. Moonlit rose terrarium

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a small glass cloche containing one sculptural blush rose, curling leaves, a few suspended golden dust motes, and a tiny crescent moon charm. Glass should be slightly frosted but the rose must remain readable. Materials: warm brass rim, dusty pink petals, deep green leaves, pale amber glow. The object should feel like a keepsake from a secret garden, purely atmospheric and non-interactive.

### 2. Cozy tea lantern

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a rounded ceramic teapot merged with a small glowing lantern, softly steaming with the steam curling into two abstract heart loops. Cream ceramic, terracotta blush accents, brass handle, warm candlelight inside. Friendly, intimate, slightly whimsical, substantial enough for a clean game mesh, no readable markings and no practical controls.

### 3. Velvet moon fountain

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a miniature tabletop fountain with a crescent-moon basin, a slow sculptural ribbon of water, and three smooth pebble forms. Rose velvet, pale stone, copper trim, subtle blue highlights in the water. Calm and romantic, visually legible from a board-game camera, no moving mechanical parts and no functional purpose.

### 4. Record player of little stars

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a compact vintage record player with the lid open, but instead of a record it holds a softly glowing circular night sky; a few chunky sculpted music-note shapes float above it. Walnut, rose lacquer, cream ceramic, muted brass, tiny star lights. Nostalgic and cozy, designed as a visual mood object rather than a usable machine.

### 5. Two-cup constellation tray

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a low oval tray holding two mismatched ceramic cups, with a small constellation of warm lights suspended between them like a shared atmosphere. One cup blush pink, one cup deep blue, tray in dark walnut with brass inlay. Keep the lights thick and stylized for easy modeling; no steam text, labels, or functional interaction.

### 6. Glass greenhouse heart

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a tiny greenhouse shaped like a softened heart, with translucent glass panes, one oversized flowering vine, and a warm interior glow. Copper frame, moss green leaves, coral and cream blossoms, a few rounded pots. Make the silhouette charming and slightly magical, with broad surfaces and no fragile wire details.

### 7. Sunset arch with hanging charms


> Use case: stylized-concept. Model reference for a decorative board centerpiece: a small ornamental archway with layered sunset-colored glass panels, two thick hanging charms, and a soft glowing horizon disk behind it. Peach, apricot, wine, and warm gold palette. It should read as a tiny romantic scenic prop, not a doorway or usable structure; no text and no characters.

### 8. Cloud-and-candle diorama

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a miniature floating cloud diorama on a low brass pedestal, with one rounded candle flame and a tiny star tucked into the cloud. Soft cream cloud volumes, lavender-gray shadow, peach flame, antique gold pedestal. Dreamy and quiet, with chunky stylized geometry and a stable base suitable for a GLB asset.

### 9. Garden bench with glowing fireflies

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a tiny curved garden bench beneath an oversized flowering branch, surrounded by a handful of large glowing firefly orbs. Painted sage wood, blush blossoms, warm amber lights, dark moss accents. The bench is only a scene vignette and must not imply a seatable game character or usable object.

### 10. Enchanted music box

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a closed jewel-toned music box with a translucent lid, containing a simple abstract dancing ribbon of light rather than a figurine. Deep berry lacquer, cream enamel, copper filigree kept broad and modelable, soft rose illumination. Decorative only, no key, no readable engraving, no moving parts required.

### 11. Seashell sunset sculpture

> Use case: stylized-concept. Model reference for a decorative board centerpiece: two oversized stylized seashells cupping a small glowing sunset orb, resting on a rounded piece of beach stone. Coral, sand, pearl, and muted sea-glass colors. Romantic coastal mood, simple broad ridges for clean topology, no water effects, no text, no functional purpose.

### 12. Holiday window vignette

> Use case: stylized-concept. Model reference for a decorative board centerpiece: a miniature frosted window frame with a warm interior glow, a wreath made of broad leaves and berries, and two small candles on the sill. Cream frost, pine green, cranberry, honey gold. Cozy seasonal atmosphere, restrained decoration, thick modelable forms, no lettering or holiday text.

## Negative prompt

> Avoid: photorealism, people, faces, hands, text, logos, letters, UI elements, dice, cards, score markers, buttons, gameplay affordances, weapons, clutter, thin wires, needle-like foliage, floating disconnected parts, transparent materials that hide the silhouette, excessive bloom, neon colors, harsh black outlines, noisy backgrounds, multiple objects, and a large footprint that blocks the board.

## Modeling handoff notes

- Ask for a front/3/4/side reference sheet when the generator supports it.
- Keep the main silhouette readable at thumbnail size; the board camera should do most of the work.
- Use broad bevels and thick stems so the asset survives GLB export and mobile rendering.
- Put the visual detail in color, roughness, emission, and a few large shapes instead of dense micro-geometry.
- Make the base visually quiet and easy to hide inside the board surface; the object should feel placed, not like a new gameplay tile.
