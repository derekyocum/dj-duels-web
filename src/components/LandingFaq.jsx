import { useState } from 'react'

// Answers to the questions people actually hit, phrased honestly -- the
// Spotify Premium and mobile-playback limits are real and it's better to say
// so here than to have someone discover them mid-duel. See NowPlaying and
// spotifyWebPlayback for where each limit actually comes from.
const FAQ = [
  {
    q: 'Do I need Spotify Premium?',
    a: 'No. You can play, vote, and win with no account connected at all. Connecting Spotify Premium is what unlocks full-length tracks instead of 30-second previews — without it you still see the artwork, the timer, and everyone else\'s votes in sync.',
  },
  {
    q: 'Does it work with YouTube?',
    a: 'Yes, and YouTube tracks play in full for everyone with no account needed. You can mix Spotify and YouTube picks in the same duel.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. No accounts to upgrade, nothing to buy.',
  },
  {
    q: 'How many people can play?',
    a: 'Two to seven. Anything above two runs as a bracket — you battle 1v1 each round and the winners advance until someone takes the crown.',
  },
  {
    q: 'What\'s the Listening Lounge?',
    a: 'The opposite of a duel: no rounds, no timer, no winner. You and your friends share a queue and everyone hears the same moment of the same song, for as long as you want. It\'s friends-only.',
  },
  {
    q: 'Does everyone need the app?',
    a: 'No. It runs in a browser on any device. The mobile app is the same rooms and the same duels, just native.',
  },
]

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-text-muted/10">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
      >
        <span className="text-text-primary font-semibold group-hover:text-neon-blue transition-colors">
          {item.q}
        </span>
        <span
          className={`shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="text-text-secondary text-sm leading-relaxed pb-5 pr-8">{item.a}</p>
      )}
    </div>
  )
}

function LandingFaq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative z-10 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-10">
          Before you <span className="text-neon-blue">start</span>
        </h2>
        <div>
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingFaq
