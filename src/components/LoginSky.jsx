import { BrandIcon } from './BrandIcon.jsx'
import './login-sky.css'

export function LoginSky() {
  return <div className="login-sky" aria-hidden="true">
    <i className="shooting-star" />
    <i className="shooting-star second" />
    {[[12,17],[81,11],[88,54],[17,72],[70,89]].map(([left,top], index) => <span className="login-star-glint" key={left} style={{ left: `${left}%`, top: `${top}%`, '--glint-delay': `${index * 7}s` }}><BrandIcon name="sparkle" /></span>)}
  </div>
}
