const BOARD_THEME_ORDER = ['cozy', 'garden', 'beach', 'city', 'holiday']

export const BOARD_THEME_SETS = {
  cozy: {
    id: 'cozy',
    label: 'Cozy night in',
    surfaces: {
      inset: {
        color: '#f4d8dc',
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
      },
    ],
  },
  garden: {
    id: 'garden',
    label: 'Secret garden',
    surfaces: {
      inset: {
        color: '#f2e5ca',
        repeat: [3, 3],
        texture: '/assets/board/rose-velvet-texture-v2.png',
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
        position: [5.2, 0.9, 3.4],
        rotation: -0.2,
        size: 1.15,
      },
      {
        id: 'garden-songbird',
        label: 'Garden songbird',
        model: '/assets/board/garden/garden-songbird.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.26,
        size: 1.4,
      },
    ],
  },
  beach: {
    id: 'beach',
    label: 'Seaside date',
    surfaces: {
      inset: {
        color: '#d8edf0',
        repeat: [3, 3],
        texture: '/assets/board/rose-velvet-texture-v2.png',
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
      },
      {
        id: 'beach-deck-chair',
        label: 'Striped deck chair',
        model: '/assets/board/beach/striped-deck-chair.glb',
        position: [0.1, -0.02, 5.5],
        rotation: 0.08,
        size: 1.75,
      },
    ],
  },
  city: {
    id: 'city',
    label: 'City date night',
    surfaces: {
      inset: {
        color: '#e7d6ec',
        repeat: [3, 3],
        texture: '/assets/board/rose-velvet-texture-v2.png',
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
        position: [6.4, -0.02, -3.6],
        rotation: 0.48,
        size: 1.45,
      },
      {
        id: 'city-love-note-bouquet',
        label: 'Love-note bouquet',
        model: '/assets/board/city/love-note-bouquet.glb',
        position: [-5.1, -0.02, 3.2],
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
    surfaces: {
      inset: {
        color: '#f2dbd7',
        repeat: [3, 3],
        texture: '/assets/board/rose-velvet-texture-v2.png',
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
        position: [6.4, -0.02, -3.6],
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
    surfaces: {
      inset: { color: '#2a3358' },
      tabletop: { color: '#1c2340' },
    },
  },
  'autumn-embers': {
    base: 'garden',
    label: 'Autumn Embers',
    surfaces: {
      inset: { color: '#e8a54b' },
      tabletop: { color: '#f7e3c2' },
    },
  },
  'cherry-blossom': {
    base: 'garden',
    label: 'Cherry Blossom',
    surfaces: {
      inset: { color: '#f6b8cd' },
      tabletop: { color: '#ffe9f1' },
    },
  },
  'aurora-veil': {
    base: 'beach',
    label: 'Aurora Veil',
    surfaces: {
      inset: { color: '#123c4a' },
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
    surfaces: {
      inset: { ...base.surfaces.inset, ...remix.surfaces.inset },
      tabletop: { ...base.surfaces.tabletop, ...remix.surfaces.tabletop },
    },
  }
}
