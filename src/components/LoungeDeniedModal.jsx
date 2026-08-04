import { useNavigate } from 'react-router'

const COPY = {
  friends_only: {
    title: 'This lounge is friends only',
    body: "You need to be friends with whoever started it. Send them a friend request and ask them to accept.",
  },
  full: {
    title: 'This lounge is full',
    body: 'Try again once someone heads out.',
  },
}

/**
 * Floating modal for the two /lounge/join denial reasons, replacing what
 * used to be a full-page swap in Lounge.jsx. Both just point back to
 * Profile -- friends live there, and there's nothing else useful to do
 * about "full".
 */
function LoungeDeniedModal({ reason }) {
  const navigate = useNavigate()
  const copy = COPY[reason] ?? COPY.friends_only

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div
        className="bg-dark-surface border border-ember/25 rounded-2xl p-8 max-w-md w-full text-center"
        role="dialog"
        aria-modal="true"
      >
        <span className="text-5xl block mb-4">🚪</span>
        <h1 className="text-xl font-bold text-text-primary mb-2">{copy.title}</h1>
        <p className="text-text-secondary text-sm mb-6">{copy.body}</p>

        <button
          onClick={() => navigate('/profile')}
          className="px-6 py-2.5 text-sm font-semibold rounded-full bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25 transition-colors cursor-pointer"
        >
          Go to friends
        </button>
      </div>
    </div>
  )
}

export default LoungeDeniedModal
