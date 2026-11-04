import { INK_BRUSHES } from './drawingInk.js'
import './ink-toolbar.css'

export function InkToolbar({ brush, color, size, onBrushChange, onColorChange, onSizeChange, disabled }) {
  return <div className="ink-toolbar">
    <div className="ink-brushes" role="group" aria-label="Drawing brushes">
      {INK_BRUSHES.map(option => <button key={option.id} type="button" disabled={disabled} aria-pressed={brush === option.id} onClick={() => onBrushChange(option.id)}>
        {option.label}
      </button>)}
    </div>
    <div className="ink-options">
      <label className="ink-spectrum">Color<input aria-label="Ink color spectrum" type="color" disabled={disabled} value={color} onChange={event => onColorChange(event.target.value)} /></label>
      <label>Size<input aria-label="Brush size" type="range" min="0.5" max="2" step="0.25" disabled={disabled} value={size} onChange={event => onSizeChange(Number(event.target.value))} /></label>
    </div>
  </div>
}
