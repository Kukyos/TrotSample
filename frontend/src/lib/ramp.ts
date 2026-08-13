// Sequential ramp for every chart and colour-coded surface in the app.
//
// DESIGN.md allows one accent hue, so a categorical palette is impossible here:
// five distinct hues would break the system and a grey set fails the chroma
// floor. Charts therefore sort by magnitude and shade by rank, and always carry
// a visible label so identity never depends on colour alone.
//
// Validated against the #090909 surface: OKLab L 0.928 → 0.543, monotonic,
// adjacent ΔL 0.089–0.110, contrast 15.9:1 → 3.7:1 (all above the 3:1 floor).

export const RAMP = ['#efe0ff', '#dbb6ff', '#c78dff', '#af50ff', '#8257b0'] as const

/** Ramp step for slice `index`, clamped to the darkest step. */
export function rampStep(index: number) {
  return RAMP[Math.min(index, RAMP.length - 1)]
}
