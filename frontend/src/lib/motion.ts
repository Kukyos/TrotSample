/** React Bits animates via GSAP and WebGL, which the CSS `prefers-reduced-motion`
 *  block in styles.css cannot reach. Components consult this instead. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
