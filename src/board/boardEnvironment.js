import * as THREE from 'three'

const SKY_VERTEX = `
varying vec3 vDirection;
void main() {
  vDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const SKY_FRAGMENT = `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform float uTime;
uniform float uStars;
uniform float uAurora;
varying vec3 vDirection;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 direction = normalize(vDirection);
  float height = direction.y;
  // The board camera looks down; bias the gradient so its upper viewport still
  // shows the sky instead of a flat patch below the geometric horizon.
  float viewHeight = height + 0.58;
  vec3 sky = viewHeight >= 0.0
    ? mix(uHorizon, uTop, smoothstep(0.0, 0.7, viewHeight))
    : mix(uHorizon, uBottom, smoothstep(0.0, 0.65, -viewHeight));
  float driftingHaze = sin(direction.x * 7.0 + uTime * 0.055)
    * sin(direction.z * 5.0 - uTime * 0.04);
  sky += uGlow * (0.025 + driftingHaze * 0.025) * smoothstep(-0.3, 0.4, viewHeight);
  vec2 starGrid = direction.xy * 130.0;
  float starCell = hash(floor(starGrid));
  float starShape = 1.0 - smoothstep(0.04, 0.22, length(fract(starGrid) - 0.5));
  float twinkle = 0.6 + 0.4 * sin(uTime * 1.2 + starCell * 28.0);
  float stars = step(0.992, starCell) * starShape * twinkle * smoothstep(-0.05, 0.45, viewHeight);
  sky += vec3(stars * uStars);
  float aurora = pow(max(0.0, sin(direction.x * 12.0 + uTime * 0.18)), 3.0)
    * smoothstep(0.0, 0.7, viewHeight) * uAurora;
  sky += uGlow * aurora * 0.28;
  gl_FragColor = vec4(sky, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

function initialParticlePosition(index, count) {
  const angle = index * 2.399963
  const radius = 1.7 + ((index * 13) % count) / count * 6.2
  return [
    Math.cos(angle) * radius,
    0.85 + ((index * 11) % 17) / 17 * 2.7,
    Math.sin(angle) * radius * 0.72,
  ]
}

function makeMoteTexture() {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')
  if (!context) return null
  const gradient = context.createRadialGradient(16, 16, 1, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(canvas)
}

export function createBoardEnvironment(config) {
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color(config.top) },
      uHorizon: { value: new THREE.Color(config.horizon) },
      uBottom: { value: new THREE.Color(config.bottom) },
      uGlow: { value: new THREE.Color(config.glow) },
      uTime: { value: 0 },
      uStars: { value: ['stars', 'lights', 'snow'].includes(config.mode) ? 0.4 : 0.05 },
      uAurora: { value: config.mode === 'aurora' ? 1 : 0 },
    },
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(75, 40, 24), skyMaterial)
  sky.name = `sky-${config.mode}`
  sky.renderOrder = -100

  const count = config.count || 0
  const origins = Array.from({ length: count }, (_, index) => initialParticlePosition(index, count))
  const values = new Float32Array(count * 3)
  origins.forEach(([x, y, z], index) => values.set([x, y, z], index * 3))
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(values, 3))
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: config.motes,
      map: makeMoteTexture(),
      size: config.mode === 'snow' ? 0.22 : 0.17,
      sizeAttenuation: true,
      transparent: true,
      opacity: config.mode === 'snow' ? 0.72 : 0.58,
      depthWrite: false,
    }),
  )
  particles.name = `motes-${config.mode}`

  function update(seconds, reducedMotion = false) {
    skyMaterial.uniforms.uTime.value = reducedMotion ? 0 : seconds
    if (reducedMotion) return
    origins.forEach(([x, y, z], index) => {
      const drift = seconds * (config.mode === 'snow' ? 0.27 : 0.1)
      values[index * 3] = x + Math.sin(seconds * 0.23 + index * 1.7) * 0.2
      values[index * 3 + 1] = ['snow', 'leaves', 'petals'].includes(config.mode)
        ? 0.5 + ((y - drift + 12) % 3.7)
        : y + Math.sin(seconds * 0.65 + index * 0.9) * 0.17
      values[index * 3 + 2] = z + Math.cos(seconds * 0.17 + index) * 0.13
    })
    particleGeometry.attributes.position.needsUpdate = true
  }

  return { sky, particles, update }
}
