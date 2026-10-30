import { describe, expect, it } from 'vitest'
import { BANK, pickQuiz, quizPoints, QUIZ_LENGTH, QUIZ_MAX } from './quiz'

describe('quiz bank', () => {
  it('has unique ids, ≥2 options and no duplicate options per question', () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length)
    for (const q of BANK) {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2)
      expect(new Set(q.options).size, q.id).toBe(q.options.length)
      if (q.kind === 'tf') expect([...q.options].sort()).toEqual(['False', 'True'])
    }
  })
})

describe('pickQuiz', () => {
  it('is deterministic per seed and balanced by category', () => {
    const a = pickQuiz('abc'), b = pickQuiz('abc')
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id))
    expect(a).toHaveLength(QUIZ_LENGTH)
    const count = (c: string) => a.filter((q) => q.cat === c).length
    expect([count('pop'), count('cinema'), count('sport'), count('gk'), count('campus')]).toEqual([3, 2, 2, 2, 1])
  })
  it('keeps the correct answer tracked through the shuffle', () => {
    for (const seed of ['x', 'y', 'z', 'duel-1']) {
      for (const q of pickQuiz(seed)) {
        const original = BANK.find((b) => b.id === q.id)!
        expect(q.options[q.answer]).toBe(original.options[0])
      }
    }
  })
  it('shows True before False', () => {
    for (const q of pickQuiz('tf').filter((q) => q.kind === 'tf')) expect(q.options).toEqual(['True', 'False'])
  })
})

describe('quizPoints', () => {
  it('rewards speed and streaks, capped', () => {
    expect(quizPoints(false, 15, 5)).toBe(0)
    expect(quizPoints(true, 0, 0)).toBe(100)
    expect(quizPoints(true, 15, 0)).toBe(150)
    expect(quizPoints(true, 15, 4)).toBe(300)
    expect(quizPoints(true, 15, 20)).toBe(300)
    expect(quizPoints(true, 99, 0)).toBe(150)
  })
  it('max is all-correct instant answers', () => expect(QUIZ_MAX).toBe(2626))
})
