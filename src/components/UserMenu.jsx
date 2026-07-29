import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

// Hamburger dropdown shown wherever a signed-in user needs quick access to
// Profile / Leaderboard / Sign Out -- replaces the profile-pill + separate
// sign-out button that used to be duplicated across Landing/Profile/
// Leaderboard's own hand-rolled navs.
function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!user) return null

  const handleSignOut = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-full glass hover:glass-hover transition-colors cursor-pointer"
      >
        <span className="flex flex-col gap-[3px]">
          <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
          <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
          <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-dark-surface border border-text-muted/15 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-text-muted/10">
            <p className="text-text-primary text-sm font-semibold truncate">{user.username}</p>
          </div>
          {/* No onClick-driven setOpen(false) here -- these navigate via a
              plain <a>, and closing the menu synchronously in the same click
              unmounts the anchor mid-event, which cancels React Router's
              navigation. Navigating away naturally resets this anyway: every
              page mounts its own fresh AppNav/UserMenu instance. */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors no-underline"
          >
            <span className="w-4 text-center">👤</span> Profile
          </Link>
          <Link
            to="/leaderboard"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors no-underline"
          >
            <span className="w-4 text-center">🏆</span> Leaderboard
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-neon-pink hover:bg-neon-pink/10 transition-colors cursor-pointer border-t border-text-muted/10"
          >
            <span className="w-4 text-center">🚪</span> Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
