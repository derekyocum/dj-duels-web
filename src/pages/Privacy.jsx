import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { SUPPORT_EMAIL as CONTACT_EMAIL } from '../utils/contact'

const EFFECTIVE_DATE = 'July 27, 2026'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-text-primary font-bold text-lg mb-3">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

// Applies to both the web app (dj-duels.com) and the DJ Duels iOS/Android
// app -- they share the same backend, Cognito user pool, and data practices,
// so one policy covers both rather than drifting into two documents that
// have to be kept in sync by hand.
function Privacy() {
  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <nav className="relative z-10 flex items-center px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <Logo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-neon-blue">Duels</span>
          </span>
        </a>
      </nav>

      <main className="relative z-10 flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-text-primary mb-1">Privacy Policy</h1>
          <p className="text-text-muted text-xs mb-10">Effective {EFFECTIVE_DATE} &middot; applies to the DJ Duels web app and mobile app</p>

          <Section title="What this covers">
            <p>
              This policy explains what information DJ Duels collects, why, and how you can control or delete it.
              It applies whether you&apos;re using DJ Duels at dj-duels.com or through the DJ Duels iOS/Android app --
              both use the same account system and backend, so your data is handled the same way on either.
            </p>
          </Section>

          <Section title="Information we collect">
            <p><span className="text-text-primary font-semibold">Account information.</span> When you sign up, we collect
              a username, email address, and password. Your password is never stored or seen by us directly -- it&apos;s
              handled entirely by Amazon Cognito, the authentication service we use, which stores it securely and
              never in plain text.
            </p>
            <p><span className="text-text-primary font-semibold">Gameplay data.</span> We store your duel history, wins,
              losses, trophies, games played, and the songs you pick during a match, so we can show your stats and the
              leaderboard.
            </p>
            <p><span className="text-text-primary font-semibold">Connected music accounts (optional).</span> If you choose
              to connect a Spotify or YouTube account, we store an encrypted access/refresh token for that connection
              (encrypted at rest using AWS KMS) along with your display name on that platform, so we can show it&apos;s
              connected. Searching for songs to play in a duel does not use your connected account or personal listening
              data -- search uses DJ Duels&apos; own app-level API access, not yours. You can disconnect a platform at any
              time from your Profile.
            </p>
            <p><span className="text-text-primary font-semibold">Automatically collected information.</span> Like most
              online services, our servers log IP addresses and request metadata for security purposes -- rate-limiting,
              abuse prevention, and diagnosing outages. We don&apos;t use this for advertising or tracking.
            </p>
          </Section>

          <Section title="What we don't collect">
            <p>
              DJ Duels does not use advertising or analytics SDKs, does not sell or share your data with data brokers or
              advertisers, and does not request access to your contacts, camera, microphone, photos, or location.
            </p>
          </Section>

          <Section title="How we use your information">
            <p>To create and secure your account, run duels and matchmaking, keep your stats and the leaderboard accurate,
              let you connect a Spotify/YouTube account if you choose to, and protect the service against abuse.</p>
          </Section>

          <Section title="How we share your information">
            <p>We don&apos;t sell your information. It&apos;s shared only where necessary to run the service: with our
              infrastructure providers (Amazon Web Services, which hosts our servers and databases, and Amazon Cognito,
              which handles authentication) and, if you choose to connect an account, with Spotify or Google/YouTube as
              part of that connection&apos;s standard OAuth flow.
            </p>
          </Section>

          <Section title="Data retention and deletion">
            <p>
              We keep your account data for as long as your account is active. You can permanently delete your account
              at any time from your Profile (web and mobile) -- this removes your Cognito account, your stats, and any
              connected Spotify/YouTube tokens. This action is immediate and cannot be undone.
            </p>
          </Section>

          <Section title="Security">
            <p>
              All traffic between DJ Duels and our servers is encrypted (HTTPS/WSS). Connected-platform tokens are
              encrypted at rest. Passwords are managed entirely by Amazon Cognito and never stored by us in plain text.
              No system is perfectly secure, but we design for the data we hold to be as limited and well-protected as
              reasonably possible.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>DJ Duels is not directed at children under 13, and we do not knowingly collect information from anyone
              under 13. If you believe a child has provided us information, contact us and we&apos;ll delete it.</p>
          </Section>

          <Section title="Your choices">
            <p>You can update your connected platforms or delete your account at any time from your Profile. To request
              a copy of your data or ask us anything about this policy, email us at the address below.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>If this policy changes in a meaningful way, we&apos;ll update the effective date above. Continuing to use
              DJ Duels after a change means you accept the update.</p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy or your data:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-neon-blue hover:text-neon-blue/80 transition-colors">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Privacy
