import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { SUPPORT_EMAIL, supportMailto } from '../utils/contact'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-text-primary font-bold text-lg mb-3">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

/**
 * The published Support URL for the App Store listing, and where the mobile
 * app's "Contact support" link points.
 *
 * Apple checks that a listing's Support URL leads somewhere a real person can
 * actually be reached -- a page of social links doesn't qualify, which is why
 * this exists as its own route rather than a line in the footer. It also
 * answers the questions reviewers tend to poke at (how do I delete my account,
 * why is playback only 30 seconds) so the page is genuinely useful rather than
 * a compliance shell.
 */
function Support() {
  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <nav className="relative z-10 flex items-center px-6 py-5 md:px-12">
        <a href="/" className="flex items-center no-underline">
          <Logo className="w-10 h-10" />
        </a>
      </nav>

      <main className="relative z-10 flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-text-primary mb-1">Support</h1>
          <p className="text-text-muted text-xs mb-10">
            Help with the DJ Duels web app and mobile app
          </p>

          {/* Lead with the contact route -- anyone landing here wants the
              address, not to read first. */}
          <div className="bg-card/60 border border-neon-blue/25 rounded-2xl p-6 mb-10">
            <p className="text-text-secondary text-sm mb-3">
              Questions, bug reports, and account help all go to:
            </p>
            <a
              href={supportMailto()}
              className="text-neon-blue hover:text-neon-blue/80 transition-colors text-lg font-semibold break-all"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="text-text-muted text-xs mt-3">
              We aim to reply within 2 business days.
            </p>
          </div>

          <Section title="Reporting a bug">
            <p>So we can reproduce it without a round trip, please include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your username</li>
              <li>Whether you were on the website or the mobile app (and which phone, if mobile)</li>
              <li>What you were doing — creating a duel, in a lounge, signing up</li>
              <li>What you expected, and what happened instead</li>
              <li>The duel or lounge code, if it happened in a room</li>
            </ul>
          </Section>

          <Section title="Reporting a user or something you saw">
            <p>
              If someone is behaving abusively, or a track someone queued was offensive, email us with
              their username and roughly when it happened. We review every report and act on it — that
              can mean removing content, suspending an account, or a permanent ban. There is no
              tolerance for harassment or deliberately objectionable content on DJ Duels.
            </p>
          </Section>

          <Section title="Deleting your account">
            <p>
              You can delete your account yourself, without contacting us: open <span className="text-text-primary font-semibold">Profile</span>{' '}
              and choose <span className="text-text-primary font-semibold">Delete Account</span>. It&apos;s in the same place on the
              website and in the mobile app. This immediately and permanently removes your account,
              your stats, and any connected Apple Music or YouTube accounts, and it cannot be undone.
            </p>
          </Section>

          <Section title="Common questions">
            <p>
              <span className="text-text-primary font-semibold">Why do Apple Music songs only play for 30 seconds?</span>{' '}
              That&apos;s Apple&apos;s preview clip, which is what plays when you don&apos;t have an
              Apple Music subscription connected. Connect Apple Music from your Profile for
              full-length tracks. YouTube tracks play in full for everyone, with no account needed.
            </p>
            <p>
              <span className="text-text-primary font-semibold">I never got my confirmation code.</span>{' '}
              Check your spam folder first. You can request a new code from the confirmation screen. If
              it still doesn&apos;t arrive, email us and we&apos;ll confirm the account manually.
            </p>
            <p>
              <span className="text-text-primary font-semibold">Do I need to pay for anything?</span>{' '}
              No. DJ Duels is free, with no in-app purchases, subscriptions, or ads.
            </p>
            <p>
              <span className="text-text-primary font-semibold">Why can&apos;t I join my friend&apos;s Listening Lounge?</span>{' '}
              Lounges are friends-only. You&apos;ll need to be accepted as a friend first — send a
              request from the Friends page.
            </p>
          </Section>

          <Section title="Privacy">
            <p>
              How we handle your data is covered in our{' '}
              <a href="/privacy" className="text-neon-blue hover:text-neon-blue/80 transition-colors">
                Privacy Policy
              </a>.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Support
