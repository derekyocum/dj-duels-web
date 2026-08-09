import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import UserMenu from './UserMenu'

function AppNav({ right }) {
  const { isAuthenticated } = useAuth()

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
      <a href="/" className="flex items-center gap-2 no-underline">
        <Logo className="w-7 h-7" />
        <span className="text-xl font-bold tracking-tight text-text-primary">
          DJ <span className="text-midnight-blue">Duels</span>
        </span>
      </a>
      <div className="flex items-center gap-3">
        {right}
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-full text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-semibold rounded-full border border-neon-purple/40 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple/60 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default AppNav
