import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import MusicNotes from '../components/MusicNotes'

const COLOR_BG = {
  'neon-blue': 'bg-neon-blue/20',
  'neon-pink': 'bg-neon-pink/20',
  'neon-purple': 'bg-neon-purple/20',
  'neon-green': 'bg-neon-green/20',
  'neon-yellow': 'bg-neon-yellow/20',
}

const COLOR_BORDER = {
  'neon-blue': 'border-neon-blue/50',
  'neon-pink': 'border-neon-pink/50',
  'neon-purple': 'border-neon-purple/50',
  'neon-green': 'border-neon-green/50',
  'neon-yellow': 'border-neon-yellow/50',
}

const COLOR_TEXT = {
  'neon-blue': 'text-neon-blue',
  'neon-pink': 'text-neon-pink',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-yellow': 'text-neon-yellow',
}

function Champion() {
  const location = useLocation()
  const navigate = useNavigate()
  const { champion, trackHistory = {} } = location.state || {}
  const tracks = trackHistory[champion?.name] || []

  const [carouselIndex, setCarouselIndex] = useState(0)
  const autoScrollRef = useRef(null)

  const color = champion?.color || 'neon-blue'
  const bg = COLOR_BG[color] || COLOR_BG['neon-blue']
  const border = COLOR_BORDER[color] || COLOR_BORDER['neon-blue']
  const text = COLOR_TEXT[color] || COLOR_TEXT['neon-blue']

  useEffect(() => {
    if (tracks.length <= 1) return
    autoScrollRef.current = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % tracks.length)
    }, 4000)
    return () => clearInterval(autoScrollRef.current)
  }, [tracks.length])

  return (
    <div className="relative min-h-svh flex flex-col overflow-x-hidden bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <MusicNotes />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[400px] bg-neon-purple/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-neon-blue/8 rounded-full blur-[100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎧</span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        <span className="text-5xl mb-4">👑</span>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-2 text-center">
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Give {champion?.name} aux!
          </span>
        </h1>

        <div className="mt-8 mb-6">
          <div className={`w-28 h-28 rounded-full ${bg} border-4 ${border} shadow-[0_0_60px_rgba(0,212,255,0.3)] flex items-center justify-center mx-auto`}>
            <span className={`${text} font-bold text-5xl`}>{champion?.name?.charAt(0)}</span>
          </div>
          <p className="text-text-primary font-bold text-2xl text-center mt-4">{champion?.name}</p>
        </div>

        {tracks.length > 0 && (
          <div className="w-full max-w-xl mt-4">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {tracks.map((track, i) => (
                  <div key={i} className="w-full shrink-0 px-6">
                    <div className="flex items-center gap-4 py-3">
                      {track.albumArtUrl && (
                        <img
                          src={track.albumArtUrl}
                          alt={track.album || track.name}
                          className="w-16 h-16 rounded-lg object-cover opacity-70 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-text-primary/70 font-semibold text-sm truncate">{track.name}</p>
                        <p className="text-text-muted text-xs truncate">{track.artist}</p>
                        <span className="text-text-muted/40 text-xs">Round {i + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {tracks.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {tracks.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === carouselIndex ? 'bg-text-muted/40 w-5' : 'bg-text-muted/15 w-1.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-10 px-8 py-3 text-base font-bold rounded-full border-2 border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 transition-all duration-300 cursor-pointer"
        >
          Back to Home
        </button>
      </main>

      <footer className="relative z-10 text-center py-6 text-text-muted text-xs">
        &copy; {new Date().getFullYear()} DJ Duels
      </footer>
    </div>
  )
}

export default Champion
