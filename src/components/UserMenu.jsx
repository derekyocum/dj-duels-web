import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

// Hamburger dropdown shown wherever a signed-in user needs quick access to
// Profile / Friends / Leaderboard / Sign Out -- replaces the profile-pill + separate
// sign-out button that used to be duplicated across Landing/Profile/
// Leaderboard's own hand-rolled navs.
//
// Built on Radix's DropdownMenu primitive rather than a hand-rolled
// absolute-positioned div + manual mousedown listener (the first version of
// this component) -- that version's Content rendered in-place in the DOM,
// which made it vulnerable to any ancestor's stacking context/overflow
// swallowing real clicks even though it looked correct and passed a
// synthetic .click() test. Radix's Content portals to document.body and
// handles outside-click/Escape/focus itself, sidestepping that whole class
// of bug.
function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleSignOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Menu"
          className="flex items-center justify-center w-9 h-9 rounded-full glass hover:glass-hover transition-colors cursor-pointer outline-none"
        >
          <span className="flex flex-col gap-[3px]">
            <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
            <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
            <span className="w-4 h-0.5 rounded-full bg-text-secondary" />
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="w-52 rounded-2xl bg-dark-surface border border-text-muted/15 shadow-xl overflow-hidden z-50 outline-none"
        >
          <div className="px-4 py-3 border-b border-text-muted/10">
            <p className="text-text-primary text-sm font-semibold truncate">{user.username}</p>
          </div>
          <DropdownMenu.Item asChild>
            <Link
              to="/profile"
              className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors no-underline outline-none cursor-pointer"
            >
              Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              to="/friends"
              className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors no-underline outline-none cursor-pointer"
            >
              Friends
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              to="/leaderboard"
              className="block px-4 py-2.5 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors no-underline outline-none cursor-pointer"
            >
              Leaderboard
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={handleSignOut}
            className="px-4 py-2.5 text-sm text-neon-pink hover:bg-neon-pink/10 transition-colors border-t border-text-muted/10 outline-none cursor-pointer"
          >
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default UserMenu
