'use client'
import { useId, useState } from 'react'
import { copy } from '@/config/copy'
import { NICK_MAX, sanitiseNickname } from '@/lib/sanitise'
import { CheckIcon } from '@/components/icons'

type Props = {
  defaultValue?: string
  disabled?: boolean
  /** Gallery only. */
  force?: 'hover' | 'focus'
  onValid?: (value: string | null) => void
}

/** Nickname field with live validation. Server re-validates; this is only for fast feedback. */
export function NicknameInput({ defaultValue = '', disabled, force, onValid }: Props) {
  const id = useId()
  const [value, setValue] = useState(defaultValue)
  const [touched, setTouched] = useState(defaultValue.length > 0)
  const result = sanitiseNickname(value)
  const showError = touched && !result.ok
  const msgId = `${id}-msg`
  return (
    <div className="w-full">
      <label htmlFor={id} className="label mb-2 block text-xs font-bold text-navy">{copy.nickname.label}</label>
      <div className="relative">
        <input
          id={id}
          className="field-input pr-12"
          value={value}
          maxLength={NICK_MAX + 8}
          autoComplete="nickname"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="next"
          placeholder={copy.nickname.placeholder}
          disabled={disabled}
          data-force={force}
          aria-invalid={showError || undefined}
          aria-describedby={msgId}
          onChange={(e) => {
            setValue(e.target.value)
            const r = sanitiseNickname(e.target.value)
            onValid?.(r.ok ? r.value : null)
          }}
          onBlur={() => setTouched(true)}
        />
        {result.ok && (
          <span className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-navy text-cream-hi" aria-hidden="true">
            <CheckIcon size={18} />
          </span>
        )}
      </div>
      <p id={msgId} className={`mt-2 min-h-5 text-sm ${showError ? 'font-semibold text-maroon' : 'text-ink-soft'}`} aria-live="polite">
        {showError ? copy.nickname.errors[result.error] : result.ok ? copy.nickname.ok : copy.nickname.hint}
      </p>
    </div>
  )
}
