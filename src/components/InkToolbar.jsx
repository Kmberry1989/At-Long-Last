import { BrandIcon } from './BrandIcon.jsx'
import { INK_BRUSHES } from './drawingInk.js'
import './ink-toolbar.css'

export function InkToolbar({ brush, color, size, onBrushChange, onColorChange, onSizeChange, disabled }) {
  return <div className="ink-toolbar">
    <div className="ink-brushes" role="group" aria-label="Drawing brushes">
      {INK_BRUSHES.map(option => <button key={option.id} type="button" disabled={disabled} aria-pressed={brush === option.id} onClick={() => onBrushChange(option.id)}>
        <BrandIcon name="palette" />{option.label}
      </button>)}
    </div>
    <div className="ink-options">
      <div className="ink-colors" role="group" aria-label="Ink color">
        {[['#201718', 'Carbon'], ['#6b3656', 'Plum'], ['#a8752f', 'Gold']].map(([value, label]) => <button key={value} type="button" disabled={disabled} aria-label={`${label} ink`} aria-pressed={color === value} style={{ '--ink-color': value }} onClick={() => onColorChange(value)}>{color === value && <BrandIcon name="check" />}</button>)}
      </div>
      <label>Size<input aria-label="Brush size" type="range" min="0.5" max="2" step="0.25" disabled={disabled} value={size} onChange={event => onSizeChange(Number(event.target.value))} /></label>
    </div>
    <p>{brush === 'fine' ? 'A steady, precise line.' : 'Press a stylus for weight, or draw slowly for thicker ink.'}</p>
  </div>
}
