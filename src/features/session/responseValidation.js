export function hasThreeLetters(value) {
  return (String(value ?? '').match(/\p{L}/gu) || []).length >= 3
}
