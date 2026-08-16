import type { ReactNode } from 'react'
import AnimatedContent from '../reactbits/AnimatedContent'
import SpotlightCard from '../reactbits/SpotlightCard'
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

/* The React Bits Aurora background was tried in the hero and removed, on the
   belief that its WebGL canvas was stalling the compositor. That was wrong: the
   frozen frames were an automated browser tab running in the background, where
   Chrome suspends requestAnimationFrame entirely. Aurora was never shown to be
   slow. To restore it: `npm i ogl`, copy Aurora.tsx/.css from
   github.com/DavidHDev/react-bits (src/ts-default/Backgrounds/Aurora), and
   export a HeroAurora wrapper here guarded by prefersReducedMotion(). */
