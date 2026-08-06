import { avatarById, AVATAR_BG, AVATAR_BORDER, AVATAR_TEXT } from '../utils/avatarOptions'

/**
 * The current trophy leader, on the landing page.
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
    <section className="relative z-10 px-6 pb-4">
      <div className="max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-neon-yellow/25 bg-card/50 px-6 py-5 flex items-center gap-5">
          {/* Warm wash, same gold language the Final badge and champion screen
              already use -- gradient only, no blur filter. */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'radial-gradient(80% 120% at 0% 0%, rgba(255,240,31,0.10), transparent 60%)' }}
          />

          <div className={`relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${
            avatar ? `${AVATAR_BG[avatar.color]} ${AVATAR_BORDER[avatar.color]}` : 'bg-neon-yellow/15 border-neon-yellow/40'
          }`}>
            {avatar ? (
              <span className={AVATAR_TEXT[avatar.color]}><avatar.Icon size={30} /></span>
            ) : (
              <span className="text-neon-yellow font-black text-2xl">{initial}</span>
            )}
            <span className="absolute -top-2 -right-1 text-lg" aria-hidden="true">👑</span>
          </div>

          <div className="relative min-w-0">
            <p className="text-neon-yellow text-[10px] font-black uppercase tracking-[0.2em] mb-1">
              Top of the board
            </p>
            <p className="text-text-primary font-bold text-xl truncate">{champion.username}</p>
            <p className="text-text-secondary text-sm">
              <span className="text-neon-yellow font-bold tabular-nums">{champion.trophies}</span>
              {' '}{champion.trophies === 1 ? 'trophy' : 'trophies'}
              <span className="text-text-muted"> · {champion.wins}W&nbsp;{champion.losses}L</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChampionSpotlight
