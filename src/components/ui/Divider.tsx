/** Poster divider: maroon half, navy half (ref-1/ref-2). */
export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`divider-split mx-auto w-full max-w-[460px] ${className}`} />
}
