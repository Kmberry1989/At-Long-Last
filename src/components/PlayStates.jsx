/**
 * Shared two-phone state components. Every turn follows the same
 * orient -> act -> wait -> reveal contract so the non-active phone always
 * sees who is acting, what is private, and what happens next. Normal waiting
 * always names the state — never a dead spinner.
 */

export function ActiveTurnState({ hint }) {
  return (
    <div aria-live="polite" className="play-state play-state-active" role="status">
      <p className="play-state-kicker">Your turn</p>
      <p className="play-state-copy">{hint || 'One action, then your partner takes over.'}</p>
    </div>
  )
}

export function WaitingState({
  activityVerb = 'taking their turn',
  actorName = 'Your partner',
  nextHint,
  privateNote,
}) {
  return (
    <div aria-live="polite" className="play-state play-state-waiting" role="status">
      <p className="play-state-kicker">
        <span aria-hidden="true" className="play-state-pulse">◌</span>
        {` ${actorName} is ${activityVerb}…`}
      </p>
      {privateNote && <p className="play-state-private">{privateNote}</p>}
      {nextHint && <p className="play-state-next">{nextHint}</p>}
    </div>
  )
}

export function ReadyToRevealState({
  actorName = 'Your partner',
  nextHint = 'We will open both answers together.',
}) {
  return (
    <div aria-live="polite" className="play-state play-state-reveal" role="status">
      <p className="play-state-kicker">Ready to reveal</p>
      <p className="play-state-copy">
        {actorName} answered too. Nothing to do but stay close.
      </p>
      <p className="play-state-next">{nextHint}</p>
    </div>
  )
}

export function PartnerAwayState({
  actorName = 'Your partner',
  detail = 'Their place is saved — nothing is lost while they reconnect.',
  onRetry,
}) {
  return (
    <div aria-live="polite" className="play-state play-state-away" role="status">
      <p className="play-state-kicker">{actorName}&apos;s phone went quiet.</p>
      <p className="play-state-copy">{detail}</p>
      {onRetry && (
        <button className="ghost-btn" onClick={onRetry} type="button">
          Try Again
        </button>
      )}
    </div>
  )
}

const STATE_COMPONENTS = {
  active: ActiveTurnState,
  away: PartnerAwayState,
  reveal: ReadyToRevealState,
  waiting: WaitingState,
}

export function PlayStatePanel({ state = 'waiting', ...props }) {
  const Component = STATE_COMPONENTS[state]

  if (!Component) {
    return null
  }

  return <Component {...props} />
}
