import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const output = join(process.cwd(), 'public/assets/board/rings')

const themes = {
  cozy: {
    base: '#42283f', metal: '#f4d39a', accent: '#d8898e', pale: '#f8e8d3',
    motifs: [
      '<path d="M55 292h146l-18 64H73Z"/><path d="M72 292v-79h110v79m-91-52h71m-71 24h71"/><path d="M84 356v20m88-20v20"/>',
      '<path d="M67 283h122v85H67Zm0 28h122m-61-28v85"/><path d="m75 319 45 40 45-40m-45 0 45 40m-45-40-45 40"/>',
      '<path d="M76 348c0-39 17-69 52-91 35 22 52 52 52 91H76Z"/><path d="M112 348v-43c0-21 31-21 31 0v43m-64-24h-25m152 0h-25"/><path d="m128 224 7-18 7 18"/>',
      '<path d="M74 318h108l-9 51H83Z"/><path d="M182 329h18c28 0 24 37-1 37h-17M96 304c-8-13 8-13 0-26m29 26c-8-13 8-13 0-26m29 26c-8-13 8-13 0-26"/>',
    ],
  },
  garden: {
    base: '#203d37', metal: '#d8ecc0', accent: '#e6a6b7', pale: '#e7d6a2',
    motifs: [
      '<path d="M128 371V254m0 72c-52 0-67-38-67-38 48-5 67 38 67 38Zm0-30c54 0 70-40 70-40-48-2-70 40-70 40Z"/><path d="M128 257c-48 18-64-30-32-39-8-45 48-53 62-10 42-3 43 49-30 49Z"/>',
      '<path d="M71 335h105v37H71Zm105 8h26v28h-26M89 335c10-36 42-59 75-57l-9 57"/><path d="m106 280 17-21 18 22m-31 30 23 24m-1-25 22-20"/>',
      '<path d="M61 349c26-34 42-77 43-128m-18 75c-16 1-27-13-27-13m53-11c15-9 23-26 23-26m-33 64c20-3 31-19 31-19"/><path d="M157 358c0-30 13-56 33-74 20 18 33 44 33 74Z"/><path d="M177 327h26m-13-14v44"/>',
      '<path d="M75 353c0-31 21-55 53-55s53 24 53 55m-106 0h106"/><path d="M128 298c-35-19-23-54 0-37 23-17 35 18 0 37Zm-42-18c-15-31 13-46 21-22m62 0c8-24 36-9 21 22"/>',
    ],
  },
  beach: {
    base: '#1c4a59', metal: '#f7dfac', accent: '#84d9d2', pale: '#ffd5c2',
    motifs: [
      '<circle cx="128" cy="290" r="57"/><path d="M128 205v-24m0 218v-24m85-85h24m-218 0h24m145-60 18-18m-156 156 18-18m120 0 18 18m-156-156 18 18"/><path d="M99 293c18-20 40-20 58 0m-58 20c18 20 40 20 58 0"/>',
      '<path d="M73 360c20-72 89-113 110-7m-110 7h110"/><path d="M128 249v111m0-111c-35 19-49 45-55 75m55-75c35 19 49 45 55 75m-55-75c-19 19-28 45-28 75m28-75c19 19 28 45 28 75"/>',
      '<path d="M52 320c25-25 50-25 76 0s51 25 76 0 51-25 76 0M52 351c25-25 50-25 76 0s51 25 76 0 51-25 76 0"/><path d="M80 277c24-39 74-52 111-22 25 20 31 43 27 67H80Z"/>',
      '<path d="m128 223 15 40 42 2-33 26 12 41-36-24-36 24 12-41-33-26 42-2Z"/><circle cx="128" cy="306" r="78" stroke-dasharray="5 12"/>',
    ],
  },
  city: {
    base: '#292740', metal: '#e2c7a0', accent: '#b9b2ef', pale: '#f4d8bd',
    motifs: [
      '<path d="M48 365V291h36v74m0 0V249h47v116m0 0v-95h42v95m0 0v-69h39v69H48Z"/><path d="M59 309h13m-13 20h13m21-59h15m-15 20h15m-15 20h15m25-43h15m-15 21h15m-15 20h15m23-13h14m-14 20h14"/>',
      '<path d="M72 365V281l56-44 56 44v84H72Z"/><path d="M96 365v-57c0-38 64-38 64 0v57m-64-51h64m-32-48v98"/><path d="M87 279h82"/>',
      '<path d="M128 373V247m0 28c-30 0-50-18-50-18s19-24 50-20m0 49c31 0 52-18 52-18s-20-24-52-20"/><circle cx="128" cy="225" r="16"/><path d="M87 373h82"/>',
      '<path d="M56 365h144m-123 0v-42h102v42m-81-42v-46h60v46"/><path d="M85 300h16m-16 13h16m26-13h16m-16 13h16m-70 24h76"/><circle cx="128" cy="242" r="14"/>',
    ],
  },
  holiday: {
    base: '#1d3a45', metal: '#e9d49a', accent: '#df8791', pale: '#d5e8dd',
    motifs: [
      '<path d="m128 195-39 57h24l-43 58h38l-50 60h140l-50-60h38l-43-58h24Z"/><path d="M128 370v28m-26-54h52m-67-34h82"/><circle cx="128" cy="240" r="8"/>',
      '<path d="M128 214c-54 0-73 44-73 83 0 44 30 71 73 71s73-27 73-71c0-39-19-83-73-83Z"/><path d="M128 214v-26m-45 101c27 19 63 19 90 0m-90 44c27 19 63 19 90 0"/><circle cx="128" cy="272" r="12"/><circle cx="94" cy="337" r="9"/><circle cx="162" cy="337" r="9"/>',
      '<path d="M73 286h110v85H73Zm0 21h110m-55-21v85"/><path d="M91 286v-34h74v34m-37-34v-20m-16 0h32"/><path d="M101 326c-12-16 12-17 0-34m27 34c-12-16 12-17 0-34m27 34c-12-16 12-17 0-34"/>',
      '<path d="M128 206v184m-65-147 130 110M63 353l130-110"/><path d="m120 215 8-13 8 13m-8 155 8 13 8-13m43-116 15-2-5 14m-126 66-15 2 5-14m4-66-5-14 15 2m126 66 5 14-15-2"/>',
    ],
  },
  'starlit-rooftop': {
    base: '#171d3d', metal: '#c4d2ff', accent: '#f5d28c', pale: '#c9a9e8',
    motifs: [
      '<path d="M54 370V298h39v72m0 0V264h43v106m0 0v-84h34v84m0 0v-50h34v50"/><path d="M66 316h16m-16 20h16m28-56h17m-17 21h17m-17 21h17m21-33h14m-14 20h14m20 0h13"/><path d="M52 370h162"/>',
      '<circle cx="128" cy="283" r="52"/><path d="m128 215 10 49 49 19-49 16-10 51-15-51-50-16 50-19Z"/><path d="M128 283h86m-22-22 22 22-22 22"/>',
      '<path d="M68 365V302l60-41 60 41v63H68Z"/><path d="M91 365v-35c0-27 39-27 39 0v35m21 0v-55h25v55"/><path d="m94 261 34-34 35 34"/><circle cx="128" cy="241" r="34" stroke-dasharray="2 10"/>',
      '<path d="M61 304c42-58 92-58 134 0m-134 37c42-58 92-58 134 0"/><circle cx="89" cy="253" r="5"/><circle cx="167" cy="238" r="7"/><circle cx="131" cy="202" r="4"/><path d="m128 207 8 21 22 1-17 14 6 21-19-12-19 12 6-21-17-14 22-1Z"/>',
    ],
  },
  'autumn-embers': {
    base: '#57372f', metal: '#f2c77a', accent: '#d7835f', pale: '#ecd7a1',
    motifs: [
      '<path d="M128 375c-65-37-88-104-4-174 56 73 60 133 4 174Z"/><path d="M128 372c-9-64-2-111-4-170m4 115 46-46m-49 23-35-36m42 74-46-12"/>',
      '<path d="M128 246c-54 33-67 89 0 123 67-34 54-90 0-123Z"/><path d="M128 247v121m-2-61-37-20m42 48 37-24"/><path d="M106 249c0-29 44-29 44 0"/>',
      '<path d="M82 303h92v69H82Zm0 18h92m-46-18v69"/><path d="M102 303v-34h52v34m-26-34v-20m-11 0h22"/><path d="m128 333 10 17h-20Z"/>',
      '<path d="M128 216c4 44 39 49 32 84-5 26-23 49-46 62-27-26-34-56-22-80 8-16 28-29 36-66Z"/><path d="M129 297c22 21 19 44-2 62-22-18-18-40 2-62Z"/>',
    ],
  },
  'cherry-blossom': {
    base: '#54334e', metal: '#f5d5e7', accent: '#d889a7', pale: '#edd49b',
    motifs: [
      '<path d="M55 371c51-37 48-90 89-132 20-21 38-27 57-31m-116 97c-24-12-37-28-42-50m79 8c-4-29 7-48 22-62"/><path d="M81 284c-25-21-7-47 13-28 23-18 38 14 11 30m42-47c-5-29 24-38 27-12 27 6 17 39-10 29"/>',
      '<path d="M69 313c-15-29 14-48 29-23 27-10 39 22 12 32m40-60c-15-29 14-48 29-23 27-10 39 22 12 32m-80 81c-15-29 14-48 29-23 27-10 39 22 12 32"/><circle cx="95" cy="300" r="4"/><circle cx="176" cy="255" r="4"/>',
      '<path d="M71 290h114l-9 80H80Z"/><path d="M88 290v-28h80v28m-40-28v-25m-13 0h26"/><path d="M101 317c-12-16 12-17 0-34m27 34c-12-16 12-17 0-34m27 34c-12-16 12-17 0-34"/>',
      '<path d="M77 329c16-48 87-75 113-29-17 31-58 48-113 29Z"/><path d="M81 329c34-8 61-19 97-38m-63 13 11-26m23 17 20 9"/><circle cx="190" cy="293" r="5"/>',
    ],
  },
  'aurora-veil': {
    base: '#143743', metal: '#aaf1d9', accent: '#b1d2ff', pale: '#e2e6aa',
    motifs: [
      '<path d="m49 367 42-91 29 49 25-72 62 114H49Z"/><path d="m77 367 15-33 18 19 10-18 15 32m28 0 14-35 14 21"/><path d="M59 378h153"/>',
      '<path d="M51 330c28-31 55-31 83 0s55 31 83 0m-166 32c28-31 55-31 83 0s55 31 83 0"/><path d="M74 279c24-35 83-47 118-17-34 6-49 26-58 48-16-19-35-30-60-31Z"/>',
      '<path d="M59 304c25-48 52-48 77 0s52 48 77 0m-154 29c25-48 52-48 77 0s52 48 77 0"/><path d="M75 261c27-43 76-56 107-42m-90 20c29-33 64-42 89-34"/>',
      '<circle cx="128" cy="292" r="54"/><path d="m128 216 11 47 45 29-45 13-11 46-14-46-45-13 45-29Z"/><circle cx="74" cy="245" r="5"/><circle cx="184" cy="240" r="7"/><circle cx="197" cy="343" r="4"/>',
    ],
  },
}

function createTexture(id, theme) {
  const panels = theme.motifs.map((_motif, index) => `
    <g transform="translate(${index * 256} 0)">
      <path d="M20 44c28 18 46 18 74 0s46-18 74 0 46 18 68 0M20 468c28-18 46-18 74 0s46 18 74 0 46-18 68 0" stroke="${theme.metal}" stroke-width="2.5" opacity=".42"/>
      <path d="M18 72v368m220-368v368" stroke="${theme.metal}" stroke-width="1.5" opacity=".18"/>
      <g fill="none" stroke="${theme.metal}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".36">
        <path d="M39 256c28-36 53-36 89 0s61 36 89 0M39 270c28 36 53 36 89 0s61-36 89 0"/>
        <path d="m128 218 9 25 25 13-25 13-9 25-9-25-25-13 25-13Z"/>
        <path d="M72 188c20 12 20 30 0 42m112-42c-20 12-20 30 0 42M72 326c20 12 20 30 0 42m112-42c-20 12-20 30 0 42"/>
      </g>
      <g fill="${theme.accent}" opacity=".85"><circle cx="34" cy="256" r="4"/><circle cx="222" cy="256" r="4"/></g>
      <path d="m128 61 7 11 13 2-10 9 3 13-13-7-12 7 2-13-10-9 14-2Z" fill="${theme.pale}" opacity=".72"/>
      <path d="m128 415 7 11 13 2-10 9 3 13-13-7-12 7 2-13-10-9 14-2Z" fill="${theme.accent}" opacity=".7"/>
    </g>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <defs>
    <linearGradient id="wall" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${theme.base}" stop-opacity=".82"/><stop offset=".48" stop-color="${theme.base}" stop-opacity=".56"/><stop offset="1" stop-color="${theme.accent}" stop-opacity=".42"/></linearGradient>
    <pattern id="weave" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(24)"><path d="M0 0v28M14 0v28" stroke="${theme.pale}" stroke-opacity=".12" stroke-width="3"/><path d="M0 14h28" stroke="${theme.metal}" stroke-opacity=".08" stroke-width="2"/></pattern>
  </defs>
  <rect width="1024" height="512" fill="url(#wall)"/>
  <rect width="1024" height="512" fill="url(#weave)"/>
  <path d="M0 26h1024M0 486h1024" stroke="${theme.metal}" stroke-width="5" opacity=".62"/>
  <path d="M0 34h1024M0 478h1024" stroke="${theme.accent}" stroke-width="2" opacity=".48"/>
  <g fill="none" stroke="${theme.metal}" opacity=".5"><path d="M0 10v18m1024-18v18M0 484v18m1024-18v18" stroke-width="4"/><path d="M0 20h1024M0 492h1024" stroke-width="1" stroke-dasharray="1 10"/></g>
  ${panels}
  <path d="M0 0v512m256-512v512m256-512v512m256-512v512m256-512v512" stroke="${theme.metal}" stroke-width="2" opacity=".2"/>
</svg>`
}

await mkdir(output, { recursive: true })
for (const [id, theme] of Object.entries(themes)) {
  await writeFile(join(output, `${id}.svg`), createTexture(id, theme))
}
console.log(`Generated ${Object.keys(themes).length} seamless board ring textures in ${output}`)
