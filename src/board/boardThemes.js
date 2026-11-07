const BOARD_THEME_ORDER = ['cozy', 'garden', 'beach', 'city', 'holiday']

function blendHexColor(source, target, amount) {
  const start = source.replace('#', '')
  const end = target.replace('#', '')
  const channels = [0, 2, 4].map((offset) => {
    const from = Number.parseInt(start.slice(offset, offset + 2), 16)
    const to = Number.parseInt(end.slice(offset, offset + 2), 16)
    return Math.round(from + (to - from) * amount).toString(16).padStart(2, '0')
  })
  return `#${channels.join('')}`
}

export function getBoardCardPilePalette(theme) {
  const accent = theme?.cardSkin?.accent || '#9b6d78'
  return {
    trash: blendHexColor(accent, '#211a29', 0.38),
    treasure: blendHexColor(accent, '#567d70', 0.34),
    discard: blendHexColor(accent, '#fff0d8', 0.28),
  }
}

export const BOARD_THEME_SETS = {
  cozy: {
    id: 'cozy',
    label: 'Cozy night in',
    environment: { top: '#2c2037', horizon: '#8b576b', bottom: '#372637', glow: '#ffc797', motes: '#f3c78a', mode: 'dust', count: 18, panorama: '/assets/board/skyboxes/cozy.webp' },
    skinOverlay: '/assets/board/skins/cozy.png',
    diceSkin: { face: '#493042', alternate: '#382335', pip: '#f4d49b', edge: '#f2d6a0', fabric: '#557b78' },
    spaceColors: { connection: '#694a68', duel: '#3c526c', heart: '#8a5367', keepsake: '#705472', oops: '#674355' },
    cardSkin: { top: '#fff0e4', bottom: '#eed6dc', ink: '#352432', accent: '#aa5b72', border: '#eac5bd' },
    surfaces: {
      inset: {
        color: '#ffffff',
        repeat: [3, 3],
        texture: '/assets/board/rose-velvet-texture-v2.png',
      },
      tabletop: {
        color: '#fff2f4',
        repeat: [3.2, 3.2],
        texture: '/assets/board/wine-velvet-texture-v2.png',
      },
    },
    decorations: [
      {
        id: 'cozy-slippers',
        label: 'Cozy slippers',
        model: '/assets/board/cozy/cozy-slippers.glb',
        position: [-6.4, -0.02, -3.8],
        rotation: -0.38,
        size: 1.8,
      },
      {
        id: 'cozy-latte',
        label: 'Latte on a coaster',
        model: '/assets/board/cozy/latte-on-coaster.glb',
        position: [6.4, -0.02, -3.6],
        rotation: 0.48,
        size: 1.5,
      },
      {
        id: 'cozy-blankets',
        label: 'Folded blankets',
        model: '/assets/board/cozy/folded-blankets.glb',
        position: [-5.1, -0.02, 3.2],
        rotation: 0.24,
        size: 1.75,
      },
      {
        id: 'cozy-record-player',
        label: 'Record player',
        model: '/assets/board/cozy/record-player.glb',
        position: [5.2, -0.02, 3.4],
        rotation: -0.2,
        size: 1.7,
      },
      {
        id: 'cozy-lamp',
        label: 'Table lamp',
        model: '/assets/board/cozy/table-lamp.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.1,
        size: 1.65,
        glow: { color: '#ffd0a1', intensity: 1.2, distance: 8 },
      },
    ],
  },
  garden: {
    id: 'garden',
    label: 'Secret garden',
    environment: { top: '#243b4a', horizon: '#b47d92', bottom: '#324b47', glow: '#e4c5a5', motes: '#d8f4a5', mode: 'fireflies', count: 25, panorama: '/assets/board/skyboxes/garden.webp' },
    skinOverlay: '/assets/board/skins/garden.png',
    diceSkin: { face: '#315241', alternate: '#243f3b', pip: '#f7e9b8', edge: '#c5dca5', fabric: '#b88c67' },
    spaceColors: { connection: '#456953', duel: '#3b5260', heart: '#725a4c', keepsake: '#436859', oops: '#71545f' },
    cardSkin: { top: '#f3efd9', bottom: '#dbe3ca', ink: '#253932', accent: '#587f62', border: '#c4d1a9' },
    surfaces: {
      inset: {
        color: '#ffffff',
        repeat: [3, 3],
        texture: '/assets/board/garden-velvet-texture.png',
      },
      tabletop: {
        color: '#e9ebc8',
        repeat: [2.5, 2.5],
        texture: '/assets/board/garden-velvet-texture.png',
      },
    },
    decorations: [
      {
        id: 'garden-rose-planter',
        label: 'Rose planter',
        model: '/assets/board/garden/rose-planter.glb',
        position: [-6.4, -0.02, -3.8],
        rotation: -0.3,
        size: 1.9,
      },
      {
        id: 'garden-bench',
        label: 'Garden bench',
        model: '/assets/board/garden/garden-bench.glb',
        position: [6.4, -0.02, -3.6],
        rotation: 0.56,
        size: 2.05,
      },
      {
        id: 'garden-watering-can',
        label: 'Watering can',
        model: '/assets/board/garden/watering-can.glb',
        position: [-5.1, -0.02, 3.2],
        rotation: 0.28,
        size: 1.55,
      },
      {
        id: 'garden-butterfly',
        label: 'Blue butterfly',
        model: '/assets/board/garden/blue-butterfly.glb',
        position: [-5.25, 1.1, -2.5],
        rotation: -0.2,
        size: 1.15,
        motion: 'flutter',
      },
      {
        id: 'garden-songbird',
        label: 'Garden songbird',
        model: '/assets/board/garden/garden-songbird.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.26,
        size: 1.4,
        motion: 'perch',
      },
    ],
  },
  beach: {
    id: 'beach',
    label: 'Seaside date',
    environment: { top: '#2e7696', horizon: '#e6ac8b', bottom: '#65819a', glow: '#f7d4b0', motes: '#f7e8c7', mode: 'sea', count: 20, panorama: '/assets/board/skyboxes/beach.webp' },
    skinOverlay: '/assets/board/skins/beach.png',
    diceSkin: { face: '#26556b', alternate: '#183f55', pip: '#f9e5b8', edge: '#aad9df', fabric: '#bd7b72' },
    spaceColors: { connection: '#316b77', duel: '#315b79', heart: '#985e62', keepsake: '#436e78', oops: '#915c62' },
    cardSkin: { top: '#f0f7f0', bottom: '#cce4e3', ink: '#173f50', accent: '#248092', border: '#abd5d5' },
    surfaces: {
      inset: {
        color: '#ffffff',
        repeat: [3, 3],
        texture: '/assets/board/beach-velvet-texture.png',
      },
      tabletop: {
        color: '#e2f0ef',
        repeat: [2.7, 2.7],
        texture: '/assets/board/beach-velvet-texture.png',
      },
    },
    decorations: [
      {
        id: 'beach-surfboard-rack',
        label: 'Surfboard rack',
        model: '/assets/board/beach/surfboard-rack.glb',
        position: [-6.4, -0.02, -3.8],
        rotation: -0.34,
        size: 2.1,
      },
      {
        id: 'beach-sandcastle',
        label: 'Sandcastle',
        model: '/assets/board/beach/sandcastle.glb',
        position: [6.4, -0.02, -3.6],
        rotation: 0.48,
        size: 1.9,
      },
      {
        id: 'beach-picnic-basket',
        label: 'Beach picnic basket',
        model: '/assets/board/beach/beach-picnic-basket.glb',
        position: [-5.1, -0.02, 3.2],
        rotation: 0.2,
        size: 1.8,
      },
      {
        id: 'beach-firepit',
        label: 'Beach fire pit',
        model: '/assets/board/beach/beach-firepit.glb',
        position: [5.2, -0.02, 3.4],
        rotation: -0.18,
        size: 1.85,
        glow: { color: '#ffba79', intensity: 1.5, distance: 7 },
      },
      {
        id: 'beach-deck-chair',
        label: 'Striped deck chair',
        model: '/assets/board/beach/striped-deck-chair.glb',
        position: [2.65, -0.02, 4.65],
        rotation: -0.28,
        size: 1.75,
      },
    ],
  },
  city: {
    id: 'city',
    label: 'City date night',
    environment: { top: '#1b1e40', horizon: '#745a8c', bottom: '#2f2946', glow: '#d8b1ef', motes: '#ffd4ab', mode: 'lights', count: 22, panorama: '/assets/board/skyboxes/city.webp' },
    skinOverlay: '/assets/board/skins/city.png',
    diceSkin: { face: '#3b315f', alternate: '#25203f', pip: '#ffe0ad', edge: '#d9b6ef', fabric: '#9079a3' },
    spaceColors: { connection: '#55466f', duel: '#38496d', heart: '#78465f', keepsake: '#594c78', oops: '#69465f' },
    cardSkin: { top: '#eee6f4', bottom: '#d8cde7', ink: '#312541', accent: '#7a5b9b', border: '#d0bee4' },
    surfaces: {
      inset: {
        color: '#ffffff',
        repeat: [3, 3],
        texture: '/assets/board/city-velvet-texture.png',
      },
      tabletop: {
        color: '#efe5ef',
        repeat: [2.2, 2.2],
        texture: '/assets/board/city-velvet-texture.png',
      },
    },
    decorations: [
      {
        id: 'city-dessert',
        label: 'Dessert for two',
        model: '/assets/board/city/dessert-for-two.glb',
        position: [-6.4, -0.02, -3.8],
        rotation: -0.38,
        size: 1.7,
      },
      {
        id: 'city-heart-coffee',
        label: 'Black heart coffee',
        model: '/assets/board/city/black-heart-coffee.glb',
        position: [-4.1, -0.02, -3.2],
        rotation: 0.48,
        size: 1.45,
      },
      {
        id: 'city-love-note-bouquet',
        label: 'Love-note bouquet',
        model: '/assets/board/city/love-note-bouquet.glb',
        position: [2.5, -0.02, 2.65],
        rotation: 0.24,
        size: 1.85,
      },
      {
        id: 'city-flower-cart',
        label: 'Flower cart',
        model: '/assets/board/city/flower-cart.glb',
        position: [5.2, -0.02, 3.4],
        rotation: -0.2,
        size: 2.1,
        glow: { color: '#f4b7d5', intensity: 0.8, distance: 7 },
      },
      {
        id: 'city-taxi',
        label: 'Little yellow taxi',
        model: '/assets/board/city/little-yellow-taxi.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.1,
        size: 1.8,
      },
    ],
  },
  holiday: {
    id: 'holiday',
    label: 'Holiday sparkle',
    environment: { top: '#1b3447', horizon: '#8097a9', bottom: '#244257', glow: '#dbeaf5', motes: '#f6f6ee', mode: 'snow', count: 42, panorama: '/assets/board/skyboxes/holiday.webp' },
    skinOverlay: '/assets/board/skins/holiday.png',
    diceSkin: { face: '#294a56', alternate: '#1b3543', pip: '#f3d58f', edge: '#d6c28d', fabric: '#a5727d' },
    spaceColors: { connection: '#365d64', duel: '#3f596c', heart: '#82545b', keepsake: '#416171', oops: '#744e56' },
    cardSkin: { top: '#f7f4e8', bottom: '#d6e5e7', ink: '#183845', accent: '#9b6d41', border: '#d2c69a' },
    surfaces: {
      inset: {
        color: '#ffffff',
        repeat: [3, 3],
        texture: '/assets/board/holiday-velvet-texture.png',
      },
      tabletop: {
        color: '#e6f0de',
        repeat: [2.2, 2.2],
        texture: '/assets/board/holiday-velvet-texture.png',
      },
    },
    decorations: [
      {
        id: 'holiday-snow-mug',
        label: 'Snowy cocoa mug',
        model: '/assets/board/holiday/snowy-cocoa-mug.glb',
        position: [-6.4, -0.02, -3.8],
        rotation: -0.38,
        size: 1.5,
      },
      {
        id: 'holiday-cocoa-jar',
        label: 'Cocoa jar',
        model: '/assets/board/holiday/cocoa-jar.glb',
        position: [-4.15, -0.02, -3.25],
        rotation: 0.48,
        size: 1.55,
      },
      {
        id: 'holiday-twinkle-lights',
        label: 'Twinkle lights',
        model: '/assets/board/holiday/twinkle-lights.glb',
        position: [-5.1, 0.02, 3.2],
        rotation: 0.24,
        size: 1.9,
        glow: { color: '#ffd5a7', intensity: 1, distance: 8 },
      },
      {
        id: 'holiday-wreath',
        label: 'Winter wreath',
        model: '/assets/board/holiday/winter-wreath.glb',
        position: [5.2, 0.12, 3.4],
        rotation: -0.2,
        size: 1.7,
      },
      {
        id: 'holiday-gift',
        label: 'Wrapped present',
        model: '/assets/board/holiday/wrapped-present.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.1,
        size: 1.6,
      },
    ],
  },
}

export function getBoardThemeForRound(round) {
  const roundNumber = Math.max(1, Math.round(Number(round) || 1))
  const themeId = BOARD_THEME_ORDER[(roundNumber - 1) % BOARD_THEME_ORDER.length]
  return BOARD_THEME_SETS[themeId]
}

/**
 * Unlockable themes are ambiance remixes of the base 3D sets: same props and
 * decorations, re-lit with new surface colors. Buying a theme pins the whole
 * night to its look instead of rotating each round.
 */
const THEME_REMIXES = {
  'starlit-rooftop': {
    base: 'city',
    label: 'Starlit Rooftop',
    environment: { top: '#0c1533', horizon: '#4b5187', bottom: '#182443', glow: '#a7b9fb', motes: '#fff0c7', mode: 'stars', count: 34, panorama: '/assets/board/skyboxes/starlit-rooftop.webp' },
    skinOverlay: '/assets/board/skins/starlit-rooftop.png',
    diceSkin: { face: '#263451', alternate: '#17243b', pip: '#ffe8b0', edge: '#aebeff', fabric: '#697eae' },
    spaceColors: { connection: '#3f4e77', duel: '#304767', heart: '#744b69', keepsake: '#464775', oops: '#68445e' },
    cardSkin: { top: '#eeebfa', bottom: '#d2d5ec', ink: '#252844', accent: '#6e6dba', border: '#c0c5ea' },
    surfaces: {
      inset: { color: '#98a8df', texture: '/assets/board/fabrics/starlit-lattice.svg' },
      tabletop: { color: '#1c2340' },
    },
  },
  'autumn-embers': {
    base: 'garden',
    label: 'Autumn Embers',
    environment: { top: '#58384c', horizon: '#d89a6e', bottom: '#674642', glow: '#e9b785', motes: '#f3c977', mode: 'leaves', count: 24, panorama: '/assets/board/skyboxes/autumn-embers.webp' },
    skinOverlay: '/assets/board/skins/autumn-embers.png',
    diceSkin: { face: '#684438', alternate: '#472d32', pip: '#ffdc91', edge: '#e6ad61', fabric: '#b37a56' },
    spaceColors: { connection: '#735038', duel: '#624653', heart: '#89504a', keepsake: '#765545', oops: '#774746' },
    cardSkin: { top: '#f7e9d0', bottom: '#ebcda9', ink: '#493027', accent: '#a65e3d', border: '#d6ae75' },
    surfaces: {
      inset: { color: '#e4ae62', texture: '/assets/board/fabrics/autumn-twill.svg' },
      tabletop: { color: '#f7e3c2' },
    },
  },
  'cherry-blossom': {
    base: 'garden',
    label: 'Cherry Blossom',
    environment: { top: '#66537c', horizon: '#efb4d0', bottom: '#7c6585', glow: '#ffe3eb', motes: '#ffd8e9', mode: 'petals', count: 32, panorama: '/assets/board/skyboxes/cherry-blossom.webp' },
    skinOverlay: '/assets/board/skins/cherry-blossom.png',
    diceSkin: { face: '#65405f', alternate: '#452b4e', pip: '#fff0cd', edge: '#f1b9d5', fabric: '#b77d96' },
    spaceColors: { connection: '#7c536f', duel: '#514b71', heart: '#965b72', keepsake: '#75547f', oops: '#875467' },
    cardSkin: { top: '#fff0f4', bottom: '#efd1e1', ink: '#442a42', accent: '#aa5c7b', border: '#edbed5' },
    surfaces: {
      inset: { color: '#f4bfd4', texture: '/assets/board/fabrics/cherry-jacquard.svg' },
      tabletop: { color: '#ffe9f1' },
    },
  },
  'aurora-veil': {
    base: 'beach',
    label: 'Aurora Veil',
    environment: { top: '#0c3445', horizon: '#4e8f91', bottom: '#174e5a', glow: '#86e8d1', motes: '#abf4db', mode: 'aurora', count: 30, panorama: '/assets/board/skyboxes/aurora-veil.webp' },
    skinOverlay: '/assets/board/skins/aurora-veil.png',
    diceSkin: { face: '#174c56', alternate: '#103842', pip: '#c3f5de', edge: '#77d7c2', fabric: '#428982' },
    spaceColors: { connection: '#286c70', duel: '#315872', heart: '#79535f', keepsake: '#316a6c', oops: '#75515c' },
    cardSkin: { top: '#e7f7f2', bottom: '#c6e5e4', ink: '#193b43', accent: '#277f7c', border: '#91d4c6' },
    surfaces: {
      inset: { color: '#61b8b8', texture: '/assets/board/fabrics/aurora-ripple.svg' },
      tabletop: { color: '#0f2b3a' },
    },
  },
}

export function getBoardThemeById(themeId) {
  if (!themeId) {
    return null
  }

  if (BOARD_THEME_SETS[themeId]) {
    return BOARD_THEME_SETS[themeId]
  }

  const remix = THEME_REMIXES[themeId]
  if (!remix) {
    return null
  }

  const base = BOARD_THEME_SETS[remix.base]

  return {
    ...base,
    id: themeId,
    label: remix.label,
    environment: { ...base.environment, ...remix.environment },
    skinOverlay: remix.skinOverlay,
    diceSkin: remix.diceSkin,
    spaceColors: remix.spaceColors,
    cardSkin: remix.cardSkin,
    surfaces: {
      inset: { ...base.surfaces.inset, ...remix.surfaces.inset },
      tabletop: { ...base.surfaces.tabletop, ...remix.surfaces.tabletop },
    },
  }
}
