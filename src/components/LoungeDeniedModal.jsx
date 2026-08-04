import { useState } from 'react'
import { useNavigate } from 'react-router'
import { getPlatformAuthorizeUrl } from '../utils/api'

const COPY = {
  friends_only: {
    icon: '🚪',
    title: 'This lounge is friends only',
    body: "You need to be friends with whoever started it. Send them a friend request and ask them to accept.",
  },
  full: {
    icon: '🚪',
    title: 'This lounge is full',
    body: 'Try again once someone heads out.',
  },
  spotify_required: {
    icon: '🎧',
    title: 'Connect Spotify to join',
    body: 'The host wants everyone in the lounge to be able to save what they hear. Connect your Spotify account, then come back and use the same link.',
  },
}

/**
 * Floating modal for all three /lounge/join denial reasons, replacing what
 * used to be a full-page swap in Lounge.jsx. spotify_required gets its own
 * action button; the other two just point back to Profile (friends live
 * there, and there's nothing else useful to do about "full").
 */
function LoungeDeniedModal({ reason }) {
  const navigate = useNavigate()
  const [connecting, setConnecting] = useState(false)

  const copy = COPY[reason] ?? COPY.friends_only

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const url = await getPlatformAuthorizeUrl('spotify')
      window.location.href = url
    } catch {
      setConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div
        className="bg-dark-surface border border-ember/25 rounded-2xl p-8 max-w-md w-full text-center"
        role="dialog"
        aria-modal="true"
      >
        <span className="text-5xl block mb-4">{copy.icon}</span>
        <h1 className="text-xl font-bold text-text-primary mb-2">{copy.title}</h1>
        <p className="text-text-secondary text-sm mb-6">{copy.body}</p>

        {reason === 'spotify_required' ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full py-3 text-sm font-bold rounded-full bg-gradient-to-r from-ember to-neon-purple text-white hover:-translate-y-0.5 transition-transform duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {connecting ? 'Redirecting…' : 'Connect Spotify'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-ember/15 text-ember border border-ember/30 hover:bg-ember/25 transition-colors cursor-pointer"
          >
            Go to friends
          </button>
        )}
      </div>
    </div>
  )
}

export default LoungeDeniedModal
