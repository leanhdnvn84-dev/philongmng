/* PhiLong TECHNOLOGY logo (public/brand). "white" on the red bar, "color" on white. */
const RATIO = 1248 / 390

export default function Logo({ variant = 'color', height = 40, className = '' }: { variant?: 'color' | 'white'; height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={variant === 'white' ? '/brand/philong-logo-white.png' : '/brand/philong-logo.png'}
      alt="PhiLong Technology"
      width={Math.round(height * RATIO)}
      height={height}
      className={`block select-none ${className}`}
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  )
}
