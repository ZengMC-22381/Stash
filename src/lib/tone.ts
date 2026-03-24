import type { Tone } from "@/types/design"

const tones: Tone[] = ["sky", "peach", "mint", "ink"]

export function toneFromString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % tones.length
  return tones[index]
}
