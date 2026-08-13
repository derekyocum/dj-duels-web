import { useState } from 'react'

// Answers to the questions people actually hit, phrased honestly -- the
// Subscription and mobile-playback limits are real and it's better to say
// so here than to have someone discover them mid-duel. See NowPlaying and
// spotifyWebPlayback for where each limit actually comes from.
const FAQ = [
  {
    q: 'Do I need an Apple Music subscription?',
    a: 'No. You can play, vote, and win with no account connected at all. Connecting Apple Music is what unlocks full-length tracks instead of 30-second previews — without it you still see the artwork, the timer, and everyone else\'s votes in sync.',
  },
  {
    q: 'Does it work with YouTube?',
    a: 'Yes, and YouTube tracks play in full for everyone with no account needed. You can mix Apple Music and YouTube picks in the same duel.',
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
    <div className="relative">
      {/* Hairline that fades out at both ends instead of a full-width rule --
          a hard edge-to-edge border is what made this read as a stack of
          boxes sitting on the page rather than text emerging from it. */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)' }}
      />

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="relative w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
      >
        {/* Open rows are lit from the left rather than outlined or filled, so
            the expanded state still belongs to the background. */}
        {isOpen && (
          <div
            className="absolute inset-0 -inset-x-6 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'radial-gradient(60% 100% at 0% 50%, rgba(0,128,255,0.07), transparent 70%)' }}
          />
        )}
        <span className={`relative font-medium transition-colors ${
          isOpen ? 'text-text-primary/90' : 'text-text-secondary group-hover:text-text-primary/80'
        }`}>
          {item.q}
        </span>
        <span
          className={`relative shrink-0 text-sm transition-all duration-300 ${
            isOpen ? 'rotate-45 text-neon-blue/70' : 'text-text-muted/60 group-hover:text-text-muted'
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      {isOpen && (
        <p className="relative text-text-secondary/80 text-sm leading-relaxed pb-5 pr-8">{item.a}</p>
      )}
    </div>
  )
}

function LandingFaq() {
  // The whole section is folded away by default. Six open questions is a wall
  // of text at the bottom of a page most people are here to act on, not read;
  // collapsed, it's one quiet line that stays out of the way until wanted.
  const [sectionOpen, setSectionOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* The label itself is the toggle -- a separate control next to it
            would be another thing to notice on a page already being quietened. */}
        <button
          onClick={() => setSectionOpen(!sectionOpen)}
          aria-expanded={sectionOpen}
          className="group mx-auto flex items-center gap-2.5 px-3 py-2 cursor-pointer"
        >
          <span className="text-text-muted/70 group-hover:text-text-secondary text-[11px] font-bold uppercase tracking-[0.24em] transition-colors">
            Before you start
          </span>
          <span
            className={`text-text-muted/50 group-hover:text-text-secondary text-[10px] transition-all duration-300 ${
              sectionOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        {sectionOpen && (
          <div className="mt-4">
            {FAQ.map((item, i) => (
              <FaqItem
                key={item.q}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LandingFaq
