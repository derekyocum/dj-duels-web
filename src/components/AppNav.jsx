import { useAuth } from '../context/AuthContext'

function AppNav({ right }) {
  const { user } = useAuth()

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
      <a href="/" className="flex items-center gap-2 no-underline">
        <span className="text-2xl">🎧</span>
        <span className="text-xl font-bold tracking-tight text-text-primary">
          DJ <span className="text-neon-blue">Duels</span>
        </span>
      </a>
      <div className="flex items-center gap-3">
        {user?.username && (
          <span className="text-text-secondary text-xs font-medium">{user.username}</span>
        )}
        {right}
      </div>
    </nav>
  )
}

export default AppNav
