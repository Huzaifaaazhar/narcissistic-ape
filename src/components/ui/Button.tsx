import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  block?: boolean
  /** Icon shown in the perforated ticket stub (primary/secondary). */
  icon?: ReactNode
  loading?: boolean
  /** Shake + maroon ring after a failed action. Pair with a visible message. */
  error?: boolean
  /** Gallery only: render hover/pressed/focus statically. */
  force?: 'hover' | 'pressed' | 'focus'
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  icon,
  loading,
  error,
  force,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: Props) {
  const cls = ['btn', variant !== 'primary' && `btn-${variant}`, size === 'sm' && 'btn-sm', block && 'btn-block', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-error={error || undefined}
      data-force={force}
      {...rest}
    >
      <span className="btn-face">
        {icon && variant !== 'ghost' && <span className="btn-stub">{icon}</span>}
        {icon && variant === 'ghost' && icon}
        {loading ? (
          <>
            <span className="btn-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="sr-only">{children}, loading</span>
          </>
        ) : (
          <span>{children}</span>
        )}
      </span>
    </button>
  )
}
