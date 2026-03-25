"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  words: string[]
  className?: string
}

const WORD_SWITCH_INTERVAL_MS = 1000
const WORD_MOTION_DURATION_MS = 680
const WORD_ROW_HEIGHT_EM = 1.2

export default function RotatingHeroWord({ words, className }: Props) {
  const normalizedWords = useMemo(() => (words.length > 0 ? words : [""]), [words])
  const wordsKey = normalizedWords.join("||")
  const [index, setIndex] = useState(0)
  const [enableTransition, setEnableTransition] = useState(true)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIndex(0)
    setEnableTransition(true)
  }, [wordsKey])

  useEffect(() => {
    if (normalizedWords.length <= 1) return

    const timer = setInterval(() => setIndex((current) => current + 1), WORD_SWITCH_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [normalizedWords.length])

  useEffect(() => {
    if (normalizedWords.length <= 1) return
    if (index !== normalizedWords.length) return

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = setTimeout(() => {
      setEnableTransition(false)
      setIndex(0)
      requestAnimationFrame(() => setEnableTransition(true))
    }, WORD_MOTION_DURATION_MS)

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
    }
  }, [index, normalizedWords.length])

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const widestWord = normalizedWords.reduce(
    (widest, candidate) => (candidate.length > widest.length ? candidate : widest),
    normalizedWords[0] || "",
  )
  const trackWords = normalizedWords.length > 1 ? [...normalizedWords, normalizedWords[0]] : normalizedWords
  const translateY = -(index * WORD_ROW_HEIGHT_EM)

  return (
    <span className={`inline-flex -mx-[0.08em] px-[0.08em] align-baseline ${className || ""}`}>
      <span className="relative inline-block h-[1.2em] overflow-hidden align-baseline">
        <span aria-hidden className="invisible block h-[1.2em] whitespace-nowrap leading-[1.2]">
          {widestWord}
        </span>
        <span
          className="absolute left-0 top-0 flex flex-col will-change-transform"
          style={{
            transform: `translateY(${translateY}em)`,
            transition: enableTransition ? `transform ${WORD_MOTION_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1)` : "none",
          }}
        >
          {trackWords.map((word, wordIndex) => (
            <span key={`${word}-${wordIndex}`} className="block h-[1.2em] whitespace-nowrap leading-[1.2]">
              {word}
            </span>
          ))}
        </span>
      </span>
    </span>
  )
}
