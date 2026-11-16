/**
 * Recording mode for promo capture (`?rec=1`), development builds only; it never exists in
 * production. Canvases render at full device density, and the dance round runs on the page
 * clock (so a frame-stepped recorder stays in sync) with an optional autoplayer (`&autoplay=1`).
 */
const params = () => (typeof window === 'undefined' ? null : new URLSearchParams(location.search))

export const isRec = () => process.env.NODE_ENV !== 'production' && !!params()?.has('rec')
export const isAutoplay = () => isRec() && !!params()?.has('autoplay')

/** Canvas pixel density: capped at 2 normally, uncapped while recording. */
export const canvasDpr = () => Math.min(isRec() ? 8 : 2, (typeof window !== 'undefined' && devicePixelRatio) || 1)
