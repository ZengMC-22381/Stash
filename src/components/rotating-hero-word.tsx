"use client"

import { useEffect, useState } from "react"

type Props = {
  words: string[]
  className?: string
}

export default function RotatingHeroWord({ words, className }: Props) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    if (words.length <= 1) return

    const timer = setInterval(() => {
      setIndex((current) => {
        const next = current + direction

        if (next >= words.length - 1) {
          setDirection(-1)
        } else if (next <= 0) {
          setDirection(1)
        }

        return Math.max(0, Math.min(words.length - 1, next))
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [direction, words.length])

  return (
    <span className={`inline-flex h-[1.1em] overflow-hidden align-baseline ${className || ""}`}>
      <span
        className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateY(-${index * 100}%)` }}
      >
        {words.map((word) => (
          <span key={word} className="block h-[1.1em] whitespace-nowrap">
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}
