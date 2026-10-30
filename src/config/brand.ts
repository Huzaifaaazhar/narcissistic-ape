/**
 * Single source for every name the app shows. Rename here only.
 * The school is original on purpose: no film school names, logos, or characters (spec section 1).
 */
export const brand = {
  gameTitle: 'Student of the Year',
  school: "St. Alder's",
  schoolLong: "St. Alder's College",
  schoolShort: "St. A's",
  tagline: 'Friends. Rivals. First loves. Big dreams.',
  houses: {
    red: { name: 'Red House', short: 'Red', motto: 'Fortune favours the loud.' },
    blue: { name: 'Blue House', short: 'Blue', motto: 'Calm waters, deep wins.' },
  },
} as const

export type House = keyof typeof brand.houses
