const piece = (id, label, category) => ({
  avatar: `/assets/players/${id}.glb`,
  category,
  id,
  label,
  thumbnail: `/assets/players/thumbs/${id}.webp`,
})

export const PLAYER_PIECE_CATEGORIES = [
  { id: 'romance', label: 'Love Notes' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'game-night', label: 'Game Night' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'creative', label: 'Creative' },
]

export const PLAYER_PIECES = [
  piece('heart', 'Heart', 'romance'),
  piece('ring', 'Ring', 'romance'),
  piece('cupid', 'Cupid', 'romance'),
  piece('rose-bouquet', 'Rose Bouquet', 'romance'),
  piece('gift-box', 'Gift Box', 'romance'),
  piece('teddy-bear', 'Teddy Bear', 'romance'),

  piece('curled-cat', 'Curled Cat', 'cozy'),
  piece('puppy', 'Puppy', 'cozy'),
  piece('rabbit', 'Rabbit', 'cozy'),
  piece('owl', 'Owl', 'cozy'),
  piece('penguin', 'Penguin', 'cozy'),
  piece('dolphin', 'Dolphin', 'cozy'),
  piece('tiger', 'Tiger', 'cozy'),
  piece('gorilla', 'Gorilla', 'cozy'),
  piece('chicken', 'Chicken', 'cozy'),
  piece('strawberry', 'Strawberry', 'cozy'),
  piece('campfire', 'Campfire', 'cozy'),
  piece('hot-air-balloon', 'Hot Air Balloon', 'cozy'),

  piece('game-controller', 'Game Controller', 'game-night'),
  piece('chess-knight', 'Chess Knight', 'game-night'),
  piece('royal-crown', 'Royal Crown', 'game-night'),
  piece('jeweled-crown', 'Jeweled Crown', 'game-night'),
  piece('floral-crown', 'Floral Crown', 'game-night'),
  piece('treasure-chest', 'Treasure Chest', 'game-night'),
  piece('jester-hat', 'Jester Hat', 'game-night'),
  piece('magic-wand', 'Magic Wand', 'game-night'),
  piece('throne', 'Throne', 'game-night'),
  piece('horseshoe', 'Horseshoe', 'game-night'),
  piece('paw-print', 'Paw Print', 'game-night'),
  piece('maple-leaf', 'Maple Leaf', 'game-night'),
  piece('hourglass', 'Hourglass', 'game-night'),

  piece('locomotive', 'Locomotive', 'adventure'),
  piece('scooter', 'Scooter', 'adventure'),
  piece('motorcycle', 'Motorcycle', 'adventure'),
  piece('classic-car', 'Classic Car', 'adventure'),
  piece('airplane', 'Airplane', 'adventure'),
  piece('sailboat', 'Sailboat', 'adventure'),
  piece('globe-classic', 'Classic Globe', 'adventure'),
  piece('globe-vintage', 'Vintage Globe', 'adventure'),
  piece('camera', 'Camera', 'adventure'),
  piece('sneaker', 'Sneaker', 'adventure'),

  piece('microphone', 'Microphone', 'creative'),
  piece('music-note', 'Music Note', 'creative'),
  piece('guitar', 'Guitar', 'creative'),
  piece('pencil', 'Pencil', 'creative'),
  piece('book-stack', 'Book Stack', 'creative'),
  piece('vintage-tv', 'Vintage TV', 'creative'),
  piece('laptop', 'Laptop', 'creative'),
  piece('smartphone-classic', 'Classic Phone', 'creative'),
  piece('smartphone-modern', 'Modern Phone', 'creative'),
  piece('smartwatch', 'Smartwatch', 'creative'),
  piece('headphones', 'Headphones', 'creative'),
  piece('frying-pan', 'Frying Pan', 'creative'),
]

export const DEFAULT_PLAYER_AVATAR = PLAYER_PIECES[0].avatar

const SUPPORTED_PLAYER_AVATARS = new Set(
  PLAYER_PIECES.map((playerPiece) => playerPiece.avatar),
)

export const PLAYER_THEMES = [
  {
    color: '#ff7a97',
    accent: '#ff5478',
    avatar: DEFAULT_PLAYER_AVATAR,
  },
  {
    color: '#59b5ff',
    accent: '#2aa1ff',
    avatar: '/assets/players/globe-classic.glb',
  },
]

export function resolvePlayerAvatar(avatar) {
  return SUPPORTED_PLAYER_AVATARS.has(avatar)
    ? avatar
    : DEFAULT_PLAYER_AVATAR
}

export function getPlayerPiece(avatar) {
  const resolvedAvatar = resolvePlayerAvatar(avatar)
  return PLAYER_PIECES.find((playerPiece) => (
    playerPiece.avatar === resolvedAvatar
  ))
}
