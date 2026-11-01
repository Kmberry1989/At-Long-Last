import { BrandIcon } from './BrandIcon.jsx'
import './login-sky.css'

export function LoginSky({ romantic = false }) {
  return <div className="login-sky" aria-hidden="true">
    <i className="shooting-star" />
    <i className="shooting-star second" />
    {[[12,17],[81,11],[88,54],[17,72],[70,89]].map(([left,top], index) => <span className="login-star-glint" key={left} style={{ left: `${left}%`, top: `${top}%`, '--glint-delay': `${index * 7}s` }}><BrandIcon name="sparkle" /></span>)}
    {romantic && [[18, 82, 0],[36, 94, 4],[59, 86, 8],[77, 96, 12],[88, 75, 16]].map(([left,bottom,delay]) => <span className="lobby-rise-sparkle" key={left} style={{ left: `${left}%`, bottom: `${bottom}%`, '--rise-delay': `${delay}s` }}><BrandIcon name="sparkle" /></span>)}
  </div>
}
