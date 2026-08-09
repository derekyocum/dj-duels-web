import { useState } from 'react'
import { blockUser, reportUser } from '../utils/api'

// Mirrors ReportController.VALID_REASONS on the server -- the server rejects
// anything else, so these have to stay in step.
const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'offensive_content', label: 'Offensive or explicit content' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'spam', label: 'Spam or scam' },
  { id: 'other', label: 'Something else' },
]

/**
 * Block / report actions for another player, behind a "⋯" button.
 *
 * Exists wherever someone else's username is shown. Guideline 1.2 asks that
 * blocking and reporting be reachable from the content itself rather than
 * buried in settings -- the moment you want to block someone is the moment
 * you're looking at them.
 *
 * `context` is a free-text breadcrumb (e.g. "lounge ABCD") passed through to
 * the report so a moderator knows where it happened without asking.
 */
function UserActions({ username, context = '', onChanged, className = '' }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('menu') // 'menu' | 'report' | 'done'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState('')
  const [doneMessage, setDoneMessage] = useState('')

  const close = () => {
    setOpen(false)
    // Reset on close rather than on open so the closing animation doesn't
    // flash the menu view.
    setView('menu')
    setError(null)
    setDetail('')
  }

  const handleBlock = async () => {
    setBusy(true)
    setError(null)
    try {
      await blockUser(username)
      setDoneMessage(`${username} is blocked. They can't contact you or see you in lounges.`)
      setView('done')
      await onChanged?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const handleReport = async (reason) => {
    setBusy(true)
    setError(null)
    try {
      await reportUser({ username, reason, detail, context })
      setDoneMessage('Thanks — we review every report, normally within 24 hours.')
      setView('done')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Block or report ${username}`}
        title={`Block or report ${username}`}
        className={`shrink-0 px-2 py-1 rounded-full text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer leading-none ${className}`}
      >
        ⋯
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4" onClick={close}>
          <div
            className="bg-dark-surface border border-text-muted/20 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {view === 'menu' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">{username}</h2>
                <p className="text-text-secondary text-sm mb-5">
                  Blocking ends any friendship between you and stops them contacting you.
                </p>
                {error && <p className="text-neon-pink text-sm mb-3">{error}</p>}
                <div className="space-y-2">
                  <button
                    onClick={handleBlock}
                    disabled={busy}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {busy ? 'Blocking…' : `Block ${username}`}
                  </button>
                  <button
                    onClick={() => { setError(null); setView('report') }}
                    disabled={busy}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border border-text-muted/25 text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Report {username}
                  </button>
                  <button
                    onClick={close}
                    className="w-full py-2.5 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {view === 'report' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-1">Report {username}</h2>
                <p className="text-text-secondary text-sm mb-4">What happened?</p>
                {error && <p className="text-neon-pink text-sm mb-3">{error}</p>}
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleReport(id)}
                      disabled={busy}
                      className="w-full py-2.5 px-3 text-sm text-left rounded-xl border border-text-muted/20 text-text-secondary hover:text-text-primary hover:border-text-muted/40 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Anything else we should know? (optional)"
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-card border border-text-muted/20 text-text-primary rounded-xl px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-neon-blue/50 transition-colors resize-none"
                />
                <button
                  onClick={() => setView('menu')}
                  className="w-full mt-3 py-2 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                >
                  Back
                </button>
              </>
            )}

            {view === 'done' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-2">Done</h2>
                <p className="text-text-secondary text-sm mb-5">{doneMessage}</p>
                <button
                  onClick={close}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl border border-text-muted/25 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default UserActions
