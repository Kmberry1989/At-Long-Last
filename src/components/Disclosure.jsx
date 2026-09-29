import { useId, useState } from 'react'

/**
 * Progressive-disclosure wrapper. Secondary paths (public room browser,
 * lobby chat, piece catalog) live behind this so the primary private flow
 * stays uncluttered.
 */
export function Disclosure({ children, label }) {
  const [open, setOpen] = useState(false)
  const regionId = useId()

  return (
    <div className="disclosure">
      <button
        aria-controls={regionId}
        aria-expanded={open}
        className="ghost-btn disclosure-toggle"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        <span>{label}</span>
      </button>
      {open && (
        <div className="disclosure-panel" id={regionId}>
          {children}
        </div>
      )}
    </div>
  )
}
