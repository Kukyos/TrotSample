import type { ReactNode } from 'react'
import AnimatedContent from '../reactbits/AnimatedContent'
import SpotlightCard from '../reactbits/SpotlightCard'
import Aurora from '../reactbits/Aurora'
import { prefersReducedMotion } from '../../lib/motion'

/** Every React Bits component is used through this file, so the reduced-motion
 *  preference is honoured in one place instead of at every call site. */

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
}

/** Scroll-triggered entrance. Renders its children plainly when motion is off —
 *  AnimatedContent starts at `visibility: hidden`, so it must not be mounted at
 *  all in that case or the content would never appear. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  if (prefersReducedMotion()) return <div className={className}>{children}</div>

  return (
    <AnimatedContent distance={44} duration={0.7} delay={delay} threshold={0.15} className={className}>
      {children}
    </AnimatedContent>
  )
}

/** Cursor-following highlight for the trip and city cards. */
export function Spotlight({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <SpotlightCard className={`rb-card ${className}`} spotlightColor="rgba(175, 80, 255, 0.28)">
      {children}
    </SpotlightCard>
  )
}

/** The WebGL aurora behind the hero. Sized by its container, so it needs a
 *  positioned parent with real dimensions. */
export function HeroAurora() {
  if (prefersReducedMotion()) return null

  return (
    <div className="hero-aurora" aria-hidden="true">
      <Aurora colorStops={['#5227FF', '#af50ff', '#e1bdff']} amplitude={1.1} blend={0.6} speed={0.7} />
    </div>
  )
}
