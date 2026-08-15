import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

// Shared shape for Landing's two mode-picking buttons ("Find Match" and
// "Create a Lobby") -- each used to be two separate buttons (Duel/Lounge)
// sitting side by side; merged into one trigger + a 2-item dropdown so the
// hero doesn't grow a button per mode as more get added. Built on the same
// Radix DropdownMenu primitive AppNav's UserMenu already uses, for the same
// reason: it portals to document.body and handles outside-click/Escape
// itself, rather than a hand-rolled positioned div.
const PRIMARY = 'group relative px-8 py-3.5 text-base font-bold rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_30px_-4px_rgba(0,128,255,0.5)] hover:shadow-[0_0_45px_-2px_rgba(0,128,255,0.7)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-flex items-center gap-2 outline-none'
const SECONDARY = 'px-6 py-2.5 text-sm font-semibold rounded-full glass hover:glass-hover text-neon-blue hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-flex items-center gap-1.5 outline-none'

function ModeMenuButton({ label, variant = 'primary', onSelect }) {
  const isPrimary = variant === 'primary'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={isPrimary ? PRIMARY : SECONDARY}>
          {label}
          <svg
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
            className={isPrimary ? 'w-4 h-4' : 'w-3 h-3'} aria-hidden="true"
          >
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={10}
          className="w-48 rounded-2xl bg-dark-surface border border-text-muted/15 shadow-xl overflow-hidden z-50 outline-none"
        >
          <DropdownMenu.Item
            onSelect={() => onSelect('duel')}
            className="px-4 py-3 text-sm font-semibold text-neon-blue hover:bg-white/5 transition-colors outline-none cursor-pointer"
          >
            ⚔️ Duel
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => onSelect('lounge')}
            className="px-4 py-3 text-sm font-semibold text-ember hover:bg-white/5 transition-colors outline-none cursor-pointer border-t border-text-muted/10"
          >
            🎧 Lounge
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default ModeMenuButton
