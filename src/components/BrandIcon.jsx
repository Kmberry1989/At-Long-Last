import { brandIconPaths, glyphIcons, iconGlyphPattern } from './brandIcons.js'
import './brand-icon.css'

export function BrandIcon({ name = 'sparkle', label, className = '', ...props }) {
  return <svg viewBox="0 0 32 32" className={`brand-icon ${className}`} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} {...props}>
    {label && <title>{label}</title>}
    {(brandIconPaths[name] || brandIconPaths.sparkle).map((path, index) => <path key={index} d={path} />)}
  </svg>
}

// Legacy scrapbook records keep their original text. Only their presentation
// changes, so old nights receive the same icon treatment as new nights.
export function BrandText({ text }) {
  if (typeof text !== 'string') return text ?? null
  return text.split(iconGlyphPattern).map((part, index) => glyphIcons[part]
    ? <BrandIcon key={index} name={glyphIcons[part]} /> : part)
}
