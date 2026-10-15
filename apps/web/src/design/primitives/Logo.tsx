import mark from '../assets/mark.png'

/**
 * Exit Brain mark + live wordmark. The PNG wordmark's navy "Exit" vanishes on dark
 * backgrounds, so the text is rendered with theme tokens (ux-plan §4.1).
 */
export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={mark}
        alt={withWordmark ? '' : 'Exit Brain'}
        width={size}
        height={size}
        className="shrink-0"
      />
      {withWordmark && (
        <span
          className="text-[1.05rem] leading-none font-semibold tracking-tight"
          style={{ fontSize: size * 0.62 }}
        >
          <span className="text-ink">Exit</span> <span className="eb-gradient-text">Brain</span>
        </span>
      )}
    </span>
  )
}
