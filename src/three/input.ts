/**
 * Mutable scroll/pointer input shared by the landing page and the corridor scene.
 * Lives in its own module with no three.js imports so the page can write to it without
 * pulling the 3D bundle into the initial load.
 */
export const corridorInput = { progress: 0, pointerX: 0, pointerY: 0 }
