/**
 * Substring blocklist for nicknames, matched after leetspeak folding and removing separators.
 * English + common romanised Hindi/Urdu abuse. Kept deliberately short-stemmed; extend, don't loosen.
 */
export const BLOCKED_STEMS = [
  // English
  'fuck', 'fuk', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut', 'rape', 'nigg',
  'fag', 'retard', 'nazi', 'hitler', 'porn', 'penis', 'vagina', 'boob', 'tits', 'wank', 'twat',
  'bastard', 'asshole', 'kys',
  // Romanised Hindi / Urdu
  'chutiy', 'chutia', 'chut', 'bhosd', 'bhosad', 'madarch', 'maderch', 'behench', 'bhench', 'bhenchod',
  'benchod', 'lund', 'lauda', 'loda', 'lavda', 'gaand', 'gandu', 'randi', 'harami', 'haramzad',
  'kutti', 'kamina', 'kameena', 'jhant', 'tatti', 'chod', 'suar', 'khanzir', 'dalla', 'bhadwa',
  'bhadva', 'kanjar', 'phuddi', 'pudi', 'gashti', 'lun',
] as const

/** Exact names (after folding) players may not take: impersonation of staff/system. */
export const RESERVED_NAMES = [
  'admin', 'administrator', 'dean', 'thedean', 'mod', 'moderator', 'staff', 'system', 'official',
  'support', 'principal', 'root', 'null', 'undefined', 'anonymous', 'stalders', 'studentoftheyear',
] as const
