import { BLOCKED_STEMS, RESERVED_NAMES } from './blocklist'

export const NICK_MIN = 3
export const NICK_MAX = 16

// Zero-width, bidi controls, BOM, soft hyphen, and other invisible formatters.
const INVISIBLE = /[­͏؜ᅟᅠ឴឵᠋-᠏​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ]/gu
const ALLOWED = /^[\p{L}\p{N}_ ]+$/u
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i' }

export type NicknameError = 'too_short' | 'too_long' | 'bad_chars' | 'reserved' | 'blocked'
export type NicknameResult = { ok: true; value: string } | { ok: false; error: NicknameError }

/** Folds a name for abuse/reserved matching: lowercase, leet → letters, strip non-letters, collapse repeats. */
export function foldForMatch(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[0-9@$!]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1')
}

function collapseRepeats(s: string) {
  return s.replace(/(.)\1+/g, '$1')
}

/** Validates and normalises a nickname (spec 11.7). Returns the cleaned display value. */
export function sanitiseNickname(raw: string): NicknameResult {
  const value = raw.normalize('NFKC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
  if ([...value].length < NICK_MIN) return { ok: false, error: 'too_short' }
  if ([...value].length > NICK_MAX) return { ok: false, error: 'too_long' }
  if (!ALLOWED.test(value)) return { ok: false, error: 'bad_chars' }

  const folded = foldForMatch(value)
  if ((RESERVED_NAMES as readonly string[]).some((r) => folded === collapseRepeats(r))) {
    return { ok: false, error: 'reserved' }
  }
  if (BLOCKED_STEMS.some((s) => folded.includes(collapseRepeats(s)) && s.length >= 4)) {
    return { ok: false, error: 'blocked' }
  }
  // Short stems (lun, kys, fag…) only as whole tokens to avoid blocking "Lunar", "Kyser".
  const tokens = value.toLowerCase().split(/[\s_]+/).map(foldForMatch)
  if (BLOCKED_STEMS.some((s) => s.length < 4 && tokens.includes(s))) {
    return { ok: false, error: 'blocked' }
  }
  return { ok: true, value }
}
