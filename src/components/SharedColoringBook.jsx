import { useState } from 'react'
import { SHARED_COLORING_PAGES, SHARED_COLORING_PALETTE } from '../features/session/coupleArcade.js'
import './shared-coloring-book.css'

function Zone({ page, id, label, color, onPaint, children, ...shapeProps }) {
  const Shape = shapeProps.as || 'path'
  delete shapeProps.as
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onPaint(page.id, id)
    }
  }
  return <Shape
    {...shapeProps}
    aria-label={`${label}, ${color ? 'colored' : 'not colored'}`}
    className="coloring-zone"
    fill={color || '#fffaf0'}
    focusable="true"
    onClick={() => onPaint(page.id, id)}
    onKeyDown={handleKeyDown}
    role="button"
    stroke="#493348"
    strokeLinejoin="round"
    strokeLinecap="round"
    strokeWidth="3"
    tabIndex="0"
  >{children}</Shape>
}

function GardenPage({ page, colors, onPaint }) {
  const zone = (id, label, props) => <Zone key={id} page={page} id={id} label={label} color={colors[id] ? SHARED_COLORING_PALETTE.find(item => item.id === colors[id])?.value : ''} onPaint={onPaint} {...props} />
  return <svg aria-label={page.title} className="coloring-art" role="group" viewBox="0 0 360 360">
    <rect width="360" height="360" fill="#fffaf0" />
    <path d="M0 258 Q82 224 157 254 T360 248 V360 H0Z" fill="#f5ebd9" stroke="#493348" strokeWidth="3" />
    {zone('sun', 'Sun', { as: 'circle', cx: 285, cy: 64, r: 28 })}
    {zone('cloud', 'Cloud', { d: 'M45 113 C24 113 21 85 43 79 C47 54 84 53 95 73 C117 68 131 82 126 99 C125 108 117 113 107 113Z' })}
    <path d="M158 236 C156 208 167 186 176 164 M180 235 C183 208 192 188 207 172" fill="none" stroke="#493348" strokeWidth="7" strokeLinecap="round" />
    {zone('leaf-left', 'Left leaf', { d: 'M166 207 C137 205 129 186 132 168 C151 170 169 183 166 207Z' })}
    {zone('leaf-right', 'Right leaf', { d: 'M188 198 C196 176 214 168 231 173 C227 193 211 204 188 198Z' })}
    {zone('petal-1', 'Flower petal', { as: 'ellipse', cx: 177, cy: 126, rx: 15, ry: 26 })}
    {zone('petal-2', 'Flower petal', { as: 'ellipse', cx: 199, cy: 143, rx: 15, ry: 26, transform: 'rotate(72 199 143)' })}
    {zone('petal-3', 'Flower petal', { as: 'ellipse', cx: 190, cy: 169, rx: 15, ry: 26, transform: 'rotate(144 190 169)' })}
    {zone('petal-4', 'Flower petal', { as: 'ellipse', cx: 163, cy: 169, rx: 15, ry: 26, transform: 'rotate(216 163 169)' })}
    {zone('petal-5', 'Flower petal', { as: 'ellipse', cx: 154, cy: 143, rx: 15, ry: 26, transform: 'rotate(288 154 143)' })}
    <circle cx="177" cy="148" r="13" fill="#fffaf0" stroke="#493348" strokeWidth="3" />
    {zone('pot', 'Flower pot', { d: 'M128 239 H216 L204 316 Q172 330 140 316Z' })}
    {zone('watering-can', 'Watering can', { d: 'M244 226 H305 Q313 226 313 235 V278 H239 V237 Q239 226 244 226Z M313 241 L335 231 L339 239 L313 254 M251 226 C252 197 298 197 299 226' })}
    <path d="M24 312 H110 M319 313 H346 M69 246 V278 M91 253 V279" fill="none" stroke="#a88777" strokeWidth="3" strokeLinecap="round" />
  </svg>
}

function TeaPage({ page, colors, onPaint }) {
  const zone = (id, label, props) => <Zone key={id} page={page} id={id} label={label} color={colors[id] ? SHARED_COLORING_PALETTE.find(item => item.id === colors[id])?.value : ''} onPaint={onPaint} {...props} />
  return <svg aria-label={page.title} className="coloring-art" role="group" viewBox="0 0 360 360">
    <rect width="360" height="360" fill="#fffaf0" />
    <path d="M49 264 Q180 244 311 264 V316 Q181 337 49 316Z" fill="#f5ebd9" stroke="#493348" strokeWidth="3" />
    <path d="M103 122 C95 100 104 84 115 70 M180 114 C173 91 185 77 194 62 M257 122 C248 103 260 86 271 75" fill="none" stroke="#9c8291" strokeWidth="4" strokeLinecap="round" />
    {zone('plate-left', 'Left saucer', { as: 'ellipse', cx: 111, cy: 251, rx: 58, ry: 13 })}
    {zone('plate-right', 'Right saucer', { as: 'ellipse', cx: 249, cy: 251, rx: 58, ry: 13 })}
    {zone('mug-left', 'Left mug', { d: 'M72 157 Q72 146 84 146 H145 Q157 146 157 158 V224 Q157 238 143 238 H86 Q72 238 72 224Z M157 164 C192 158 194 215 157 211' })}
    {zone('tea-left', 'Tea in the left mug', { as: 'ellipse', cx: 114, cy: 158, rx: 35, ry: 8 })}
    {zone('mug-right', 'Right mug', { d: 'M203 157 Q203 146 215 146 H276 Q288 146 288 158 V224 Q288 238 274 238 H217 Q203 238 203 224Z M203 164 C168 158 166 215 203 211' })}
    {zone('tea-right', 'Tea in the right mug', { as: 'ellipse', cx: 245, cy: 158, rx: 35, ry: 8 })}
    {zone('heart', 'Heart', { d: 'M177 190 C160 174 138 191 177 222 C216 191 194 174 177 190Z' })}
    {zone('cake', 'Little cake', { d: 'M142 278 H218 L210 304 H150Z M142 278 C147 266 159 267 164 278 C170 261 187 262 191 278 C199 265 213 267 218 278' })}
    {zone('tablecloth', 'Tablecloth', { d: 'M37 316 Q180 339 323 316 V343 H37Z' })}
    <path d="M52 343 H308" stroke="#493348" strokeWidth="3" strokeLinecap="round" />
  </svg>
}

function PicnicPage({ page, colors, onPaint }) {
  const zone = (id, label, props) => <Zone key={id} page={page} id={id} label={label} color={colors[id] ? SHARED_COLORING_PALETTE.find(item => item.id === colors[id])?.value : ''} onPaint={onPaint} {...props} />
  return <svg aria-label={page.title} className="coloring-art" role="group" viewBox="0 0 360 360">
    <rect width="360" height="360" fill="#fffaf0" />
    <path d="M0 268 Q75 245 150 267 T360 261 V360 H0Z" fill="#f5ebd9" stroke="#493348" strokeWidth="3" />
    {zone('moon', 'Moon', { d: 'M278 51 C244 69 250 113 284 124 C262 133 229 119 225 91 C220 60 250 39 278 51Z' })}
    {zone('star-left', 'Left star', { d: 'M70 62 L77 80 L96 82 L82 95 L86 114 L70 104 L54 114 L58 95 L44 82 L63 80Z' })}
    {zone('star-right', 'Right star', { d: 'M165 70 L172 87 L190 89 L177 102 L181 120 L165 111 L149 120 L153 102 L140 89 L158 87Z' })}
    {zone('blanket', 'Picnic blanket', { d: 'M39 211 L317 211 L343 319 L17 319Z' })}
    <path d="M33 263 L329 263 M27 292 L336 292 M102 212 L83 319 M174 212 L170 319 M247 212 L258 319" fill="none" stroke="#493348" strokeWidth="2" />
    {zone('basket', 'Picnic basket', { d: 'M119 174 H241 L230 248 H130Z M143 174 C144 130 215 130 217 174' })}
    {zone('basket-cloth', 'Basket cloth', { d: 'M113 169 Q137 153 159 170 Q182 147 202 169 Q225 151 247 169 L241 192 H119Z' })}
    {zone('apple', 'Apple', { as: 'circle', cx: 76, cy: 195, r: 21 })}
    {zone('pear', 'Pear', { d: 'M279 175 C260 183 257 198 264 208 C248 225 260 246 281 244 C302 246 314 225 298 208 C306 197 301 182 286 176 L287 165 H275Z' })}
    {zone('flower', 'Little flower', { d: 'M63 148 C56 137 69 129 77 138 C86 126 100 135 94 147 C107 151 102 166 90 166 C91 180 75 182 70 170 C57 178 48 163 58 155Z' })}
    <path d="M76 171 V191 M69 182 L61 178 M78 180 L88 177" fill="none" stroke="#493348" strokeWidth="3" strokeLinecap="round" />
  </svg>
}

const PAGE_ART = { garden: GardenPage, 'tea-for-two': TeaPage, 'moonlit-picnic': PicnicPage }

export function SharedColoringBook({ state, playerUid, otherName, onAction }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(SHARED_COLORING_PALETTE[0].id)
  const page = SHARED_COLORING_PAGES[pageIndex]
  const colors = state.colors?.[page.id] || {}
  const filledCount = page.regions.filter(region => colors[region]).length
  const saved = state.savedPages?.includes(page.id)
  const Artwork = PAGE_ART[page.id]

  function paint(pageId, regionId) {
    onAction({ kind: 'color-region', pageId, regionId, color: selectedColor })
  }

  return <div className="arcade-game shared-coloring-game">
    <p aria-live="polite" className="arcade-turn">{saved ? `${page.title} · Saved together` : page.title}</p>
    <div aria-label="Coloring-book pages" className="coloring-pages" role="tablist">
      {SHARED_COLORING_PAGES.map((item, index) => <button aria-selected={pageIndex === index} className={`coloring-page-tab${pageIndex === index ? ' selected' : ''}${state.savedPages?.includes(item.id) ? ' is-saved' : ''}`} key={item.id} onClick={() => setPageIndex(index)} role="tab" type="button">
        <span>{index + 1}</span>{item.title}{state.savedPages?.includes(item.id) && <i aria-hidden="true">✓</i>}
      </button>)}
    </div>
    <p className="arcade-small">Color together; each brushstroke appears for both of you.</p>
    <Artwork page={page} colors={colors} onPaint={paint} />
    <div aria-label="Choose a color" className="coloring-palette" role="group">
      {SHARED_COLORING_PALETTE.map(color => <button aria-label={`${color.name}${selectedColor === color.id ? ', selected' : ''}`} aria-pressed={selectedColor === color.id} className={`coloring-swatch${selectedColor === color.id ? ' selected' : ''}`} key={color.id} onClick={() => setSelectedColor(color.id)} style={{ '--swatch-color': color.value }} type="button" />)}
    </div>
    <p aria-live="polite" className="coloring-progress">{filledCount} of {page.regions.length} details colored{saved ? ' · Finished art saved together' : ''}</p>
    {state.lastActionBy && state.lastActionBy !== playerUid && <p className="arcade-small">{otherName} just added a color.</p>}
  </div>
}
