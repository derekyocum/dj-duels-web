import { avatarById, AVATAR_BG, AVATAR_BORDER, AVATAR_TEXT } from '../utils/avatarOptions'

/**
 * The current trophy leader, on the landing page.
 *
 * Deliberately NOT a card. An outlined, filled panel reads as a separate
 * object dropped onto the page; this is a pool of light with someone standing
 * in it -- the gold bloom has no edge, so it dissolves into the same dark the
 * hero and the orbs sit on. The only hard shape is the avatar itself, which
 * is the thing actually worth looking at.
 *
 * Renders nothing at all when there's no champion yet -- the server answers
 * 204 until somebody has actually won something, and an empty throne looks
 * worse on a young app than no throne at all.
 */
function ChampionSpotlight({ champion }) {
  if (!champion) return null

  const avatar = avatarById(champion.avatarId)
  const initial = champion.username?.charAt(0).toUpperCase() ?? '?'

  return (
    <section className="relative z-10 px-6 pt-6 pb-2">
      <div className="relative max-w-md mx-auto flex items-center gap-5 py-4">
        {/* Edgeless bloom: the falloff IS the container. Nothing to align to,
            so it never reads as a box that's slightly the wrong size. */}
        <div
          className="absolute inset-0 -inset-x-12 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(50% 140% at 22% 50%, rgba(255,240,31,0.10), transparent 70%),' +
              'radial-gradient(40% 120% at 22% 50%, rgba(184,134,11,0.10), transparent 60%)',
          }}
        />

        <div className={`relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center border ${
          avatar ? `${AVATAR_BG[avatar.color]} ${AVATAR_BORDER[avatar.color]}` : 'bg-neon-yellow/10 border-neon-yellow/25'
        }`}>
          {avatar ? (
            <span className={AVATAR_TEXT[avatar.color]}><avatar.Icon size={30} /></span>
          ) : (
            <span className="text-neon-yellow font-black text-2xl">{initial}</span>
          )}
          <span className="absolute -top-2 -right-1 text-base opacity-80" aria-hidden="true">👑</span>
        </div>

        <div className="relative min-w-0">
          <p className="text-neon-yellow/60 text-[10px] font-bold uppercase tracking-[0.22em] mb-1">
            Top of the board
          </p>
          <p className="text-text-primary/90 font-bold text-lg truncate">{champion.username}</p>
          <p className="text-text-muted text-sm">
            <span className="text-neon-yellow/70 font-semibold tabular-nums">{champion.trophies}</span>
            {' '}{champion.trophies === 1 ? 'trophy' : 'trophies'}
            <span className="text-text-muted/70"> · {champion.wins}W&nbsp;{champion.losses}L</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default ChampionSpotlight
