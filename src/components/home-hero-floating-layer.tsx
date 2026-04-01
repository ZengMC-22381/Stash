"use client"

import { Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

type HeroFloatingCopy = {
  heroTagA: string
  heroTagB: string
  heroTagC: string
  badgeResource: string
  badgeSkill: string
  floatingCardLabel: string
  floatingCardTitle: string
  floatingCardTagA: string
  floatingCardTagB: string
  floatingCardTime: string
  floatingCardUpdated: string
  trending: string
  today: string
  copies: string
}

type Props = {
  copy: HeroFloatingCopy
  contributorCountLabel: string
  todayCopyCountLabel: string
  heroContributorTones: string[]
}

type DraggableCardProps = {
  constraintRef?: RefObject<HTMLDivElement | null>
  className: string
  baseRotationDeg: number
  floatClassName: string
  animationDelay?: string
  onTap?: () => void
  tapLabel?: string
  children: React.ReactNode
}

type Point = {
  x: number
  y: number
}

const FRICTION = 0.92
const FALLBACK_BOUNDS = {
  minX: -560,
  maxX: 560,
  minY: -420,
  maxY: 420,
}

const HERO_AVATARS = [
  {
    id: "cool-kids-avatar-1",
    label: "Cool Kids Avatar 1",
    src: "https://www.figma.com/api/mcp/asset/98202b28-e551-4bc9-9e76-6ba24b78a968",
  },
  {
    id: "cool-kids-illustration-1",
    label: "Cool Kids Illustration 1",
    src: "https://www.figma.com/api/mcp/asset/7b0f2c84-8bdd-4a4d-8c04-3e557312ce74",
  },
  {
    id: "cool-kids-illustration-1-1",
    label: "Cool Kids Illustration 2",
    src: "https://www.figma.com/api/mcp/asset/86a2bcc6-814d-4d02-b39b-1e60b18d5e36",
  },
  {
    id: "cool-kids-illustration-2-1",
    label: "Cool Kids Illustration 3",
    src: "https://www.figma.com/api/mcp/asset/ef699c02-3c2d-47d1-8e38-5e4ba6bab2ba",
  },
] as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function pickNextAvatarIndex(current: number, total: number) {
  if (total <= 1) return current
  const offset = Math.floor(Math.random() * (total - 1)) + 1
  return (current + offset) % total
}

function DraggableCard({
  constraintRef,
  className,
  baseRotationDeg,
  floatClassName,
  animationDelay,
  onTap,
  tapLabel,
  children,
}: DraggableCardProps) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [tilt, setTilt] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const offsetRef = useRef<Point>({ x: 0, y: 0 })
  const tiltRef = useRef(0)
  const draggingRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const velocityRef = useRef({ x: 0, y: 0, tilt: 0 })
  const lastPointerRef = useRef({ x: 0, y: 0, t: 0 })
  const travelRef = useRef(0)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const boundsRef = useRef(FALLBACK_BOUNDS)

  const commit = useCallback((nextOffset: Point, nextTilt: number) => {
    offsetRef.current = nextOffset
    tiltRef.current = nextTilt
    setOffset(nextOffset)
    setTilt(nextTilt)
  }, [])

  const stopInertia = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const updateBounds = useCallback(() => {
    const card = cardRef.current
    const container = constraintRef?.current

    if (!card || !container) {
      boundsRef.current = FALLBACK_BOUNDS
      return
    }

    const cardRect = card.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const currentOffset = offsetRef.current
    const viewportWidth = window.innerWidth

    boundsRef.current = {
      // 横向跟随 Hero 的可见宽度（全屏）约束，避免受中间内容容器宽度限制。
      minX: currentOffset.x - cardRect.left,
      maxX: currentOffset.x + (viewportWidth - cardRect.right),
      minY: currentOffset.y + (containerRect.top - cardRect.top),
      maxY: currentOffset.y + (containerRect.bottom - cardRect.bottom),
    }
  }, [constraintRef])

  const startInertia = useCallback(() => {
    stopInertia()

    const step = () => {
      const currentOffset = offsetRef.current
      const currentTilt = tiltRef.current
      const velocity = velocityRef.current

      const rawNextX = currentOffset.x + velocity.x
      const rawNextY = currentOffset.y + velocity.y
      const bounds = boundsRef.current

      const nextX = clamp(rawNextX, bounds.minX, bounds.maxX)
      const nextY = clamp(rawNextY, bounds.minY, bounds.maxY)

      if (nextX !== rawNextX) velocity.x *= -0.35
      if (nextY !== rawNextY) velocity.y *= -0.35

      velocity.x *= FRICTION
      velocity.y *= FRICTION
      velocity.tilt *= 0.86

      const nextTilt = clamp(currentTilt + velocity.tilt, -14, 14)
      const settledTilt = Math.abs(velocity.tilt) < 0.02 ? nextTilt * 0.94 : nextTilt

      commit({ x: nextX, y: nextY }, settledTilt)

      const shouldStop =
        Math.abs(velocity.x) < 0.05 && Math.abs(velocity.y) < 0.05 && Math.abs(settledTilt) < 0.08

      if (shouldStop) {
        commit({ x: nextX, y: nextY }, 0)
        frameRef.current = null
        return
      }

      frameRef.current = window.requestAnimationFrame(step)
    }

    frameRef.current = window.requestAnimationFrame(step)
  }, [commit, stopInertia])

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    pointerIdRef.current = null
    setIsDragging(false)
    startInertia()
  }, [startInertia])

  useEffect(() => {
    const onResize = () => updateBounds()
    window.addEventListener("resize", onResize)
    updateBounds()
    return () => {
      window.removeEventListener("resize", onResize)
      stopInertia()
    }
  }, [stopInertia, updateBounds])

  return (
    <div className={`pointer-events-auto ${className}`}>
      <div className={floatClassName} style={animationDelay ? { animationDelay } : undefined}>
        <div
          ref={cardRef}
          onPointerDown={(event) => {
            event.preventDefault()
            stopInertia()
            updateBounds()
            draggingRef.current = true
            pointerIdRef.current = event.pointerId
            lastPointerRef.current = { x: event.clientX, y: event.clientY, t: performance.now() }
            travelRef.current = 0
            velocityRef.current = { x: 0, y: 0, tilt: 0 }
            setIsDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (!draggingRef.current || pointerIdRef.current !== event.pointerId) return

            const now = performance.now()
            const dt = Math.max(1, now - lastPointerRef.current.t)
            const dx = event.clientX - lastPointerRef.current.x
            const dy = event.clientY - lastPointerRef.current.y
            travelRef.current += Math.abs(dx) + Math.abs(dy)
            const bounds = boundsRef.current

            const nextOffset = {
              x: clamp(offsetRef.current.x + dx, bounds.minX, bounds.maxX),
              y: clamp(offsetRef.current.y + dy, bounds.minY, bounds.maxY),
            }
            const nextTilt = clamp(tiltRef.current + dx * 0.08, -12, 12)

            const velocityX = (dx / dt) * 16
            const velocityY = (dy / dt) * 16
            velocityRef.current.x = velocityRef.current.x * 0.45 + velocityX * 0.55
            velocityRef.current.y = velocityRef.current.y * 0.45 + velocityY * 0.55
            velocityRef.current.tilt = velocityRef.current.tilt * 0.5 + velocityX * 0.16

            lastPointerRef.current = { x: event.clientX, y: event.clientY, t: now }
            commit(nextOffset, nextTilt)
          }}
          onPointerUp={(event) => {
            const shouldTriggerTap =
              Boolean(onTap) && pointerIdRef.current === event.pointerId && travelRef.current < 10
            endDrag()
            if (shouldTriggerTap) {
              onTap?.()
            }
          }}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          role={onTap ? "button" : undefined}
          tabIndex={onTap ? 0 : undefined}
          aria-label={onTap ? tapLabel : undefined}
          onKeyDown={(event) => {
            if (!onTap) return
            if (event.key !== "Enter" && event.key !== " ") return
            event.preventDefault()
            onTap()
          }}
          className={`touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${baseRotationDeg + tilt}deg)`,
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default function HomeHeroFloatingLayer({
  copy,
  contributorCountLabel,
  todayCopyCountLabel,
  heroContributorTones,
}: Props) {
  const heroCanvasRef = useRef<HTMLDivElement | null>(null)
  const [activeAvatarIndex, setActiveAvatarIndex] = useState(0)
  const [avatarTransitionPhase, setAvatarTransitionPhase] = useState<"idle" | "out" | "in">("idle")

  const cycleAvatar = useCallback(() => {
    if (avatarTransitionPhase !== "idle") return
    setAvatarTransitionPhase("out")
  }, [avatarTransitionPhase])

  const activeAvatar = HERO_AVATARS[activeAvatarIndex]
  const avatarAnimationClass =
    avatarTransitionPhase === "out"
      ? "animate-avatar-switch-out"
      : avatarTransitionPhase === "in"
        ? "animate-avatar-switch-in"
        : ""

  const handleAvatarAnimationEnd = useCallback(() => {
    if (avatarTransitionPhase === "out") {
      setActiveAvatarIndex((current) => pickNextAvatarIndex(current, HERO_AVATARS.length))
      setAvatarTransitionPhase("in")
      return
    }

    if (avatarTransitionPhase === "in") {
      setAvatarTransitionPhase("idle")
    }
  }, [avatarTransitionPhase])

  return (
    <div ref={heroCanvasRef} className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[72px] top-[96px]"
        baseRotationDeg={-9}
        floatClassName="animate-float-fast"
      >
        <div className="rounded-[24px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]">
          <div className="flex gap-2">
            {[copy.heroTagA, copy.heroTagB, copy.heroTagC].map((tag) => (
              <span key={`mini-${tag}`} className="rounded-full bg-[#f5f5f5] px-2.5 py-[2px] text-[10px] text-[#475569]">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex items-center">
              {heroContributorTones.map((tone, index) => (
                <span
                  key={`mini-${tone}`}
                  className={`-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gradient-to-br ${tone} text-[10px] font-semibold text-white`}
                  style={{ zIndex: heroContributorTones.length - index }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <span className="text-[12px] leading-4 text-[#64748b]">{contributorCountLabel}</span>
          </div>
        </div>
      </DraggableCard>

      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[22%] top-[44%]"
        baseRotationDeg={-12}
        floatClassName="animate-float-slow"
        animationDelay="-1.5s"
      >
        <div className="rounded-full bg-[#2f3334] px-4 py-2 text-[12px] font-bold tracking-[0.05em] text-white">
          {copy.badgeResource}
        </div>
      </DraggableCard>

      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[73%] top-[16%]"
        baseRotationDeg={6}
        floatClassName="animate-float-fast"
        animationDelay="-2.2s"
      >
        <div className="rounded-full bg-[#9e49f5] px-4 py-2 text-[12px] font-bold tracking-[0.05em] text-white">
          {copy.badgeSkill}
        </div>
      </DraggableCard>

      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[71%] top-[38%]"
        baseRotationDeg={-7}
        floatClassName="animate-float-slow"
        animationDelay="-1.6s"
      >
        <div className="w-[204px] rounded-[24px] bg-[#4f46e5] p-5 text-white shadow-[0px_30px_60px_-15px_rgba(79,70,229,0.3)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">{copy.floatingCardLabel}</p>
          <p className="mt-2 text-[18px] font-semibold leading-[22px]">{copy.floatingCardTitle}</p>
          <div className="mt-4 flex gap-2 text-[10px] font-semibold">
            <span className="rounded-full bg-white/20 px-3 py-1">{copy.floatingCardTagA}</span>
            <span className="rounded-full bg-white/20 px-3 py-1">{copy.floatingCardTagB}</span>
          </div>
          <p className="mt-5 text-[11px] text-white/90">
            {copy.floatingCardUpdated}, {copy.floatingCardTime}
          </p>
        </div>
      </DraggableCard>

      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[58%] top-[58%]"
        baseRotationDeg={5}
        floatClassName="animate-float-fast"
        animationDelay="-0.8s"
        onTap={cycleAvatar}
        tapLabel="Switch hero avatar"
      >
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-4 h-24 w-24 rounded-full bg-[#d6dcff]/45 blur-[34px]" />
          <div className="pointer-events-none absolute bottom-8 right-4 h-20 w-20 rounded-full bg-[#ffd8ea]/40 blur-[30px]" />
          <img
            src={activeAvatar.src}
            alt={activeAvatar.label}
            className={`relative z-10 h-[236px] w-[236px] object-contain drop-shadow-[0px_24px_42px_rgba(15,23,42,0.2)] transition-transform duration-300 ease-out hover:scale-[1.03] active:scale-[0.97] ${avatarAnimationClass}`}
            draggable={false}
            onAnimationEnd={handleAvatarAnimationEnd}
          />
        </div>
      </DraggableCard>

      <DraggableCard
        constraintRef={heroCanvasRef}
        className="absolute left-[6%] top-[66%]"
        baseRotationDeg={4}
        floatClassName="animate-float-fast"
        animationDelay="-1.1s"
      >
        <div className="h-[110px] w-[228px] rounded-[30px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-[16px] pt-[16px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-[#f5f5f5] px-3 py-[3px] text-[12px] leading-4 text-[#64748b]">{copy.trending}</span>
            <span className="text-[12px] leading-4 text-[#64748b]">{copy.today}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[33px] font-semibold leading-7 text-[#0f172a]">{todayCopyCountLabel}</div>
              <div className="mt-0.5 text-[12px] leading-4 text-[#64748b]">{copy.copies}</div>
            </div>
            <div className="h-10 w-16 rounded-[24px] bg-[linear-gradient(148deg,#6C47FF_0%,#9D7BFF_50%,#FF6B97_100%)]" />
          </div>
        </div>
      </DraggableCard>

      <Sparkles className="absolute left-[1044px] top-[190px] h-5 w-5 animate-float-slow rotate-12 text-[#b8c0ff]" />
    </div>
  )
}
