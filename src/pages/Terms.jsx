import AppBackground from '../components/AppBackground'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import { SUPPORT_EMAIL } from '../utils/contact'

const EFFECTIVE_DATE = 'August 9, 2026'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-text-primary font-bold text-lg mb-3">{title}</h2>
      <div className="text-text-secondary text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

/**
 * Terms of Use, covering the web app and the mobile app.
 *
 * The acceptable-use section is not boilerplate: App Review guideline 1.2
 * expects apps carrying user-generated content to publish terms with an
 * explicit no-tolerance stance on objectionable content and abusive users,
 * alongside the in-app block and report tools. This is the document that
 * requirement points at, so the language there is deliberately unambiguous.
 */
function Terms() {
  return (
    <div className="relative min-h-svh flex flex-col bg-gradient-to-b from-[#0a1a2e] via-midnight to-midnight">
      <AppBackground />

      <nav className="relative z-10 flex items-center px-6 py-5 md:px-12">
        <a href="/" className="flex items-center gap-2 no-underline">
          <Logo className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DJ <span className="text-midnight-blue">Duels</span>
          </span>
        </a>
      </nav>

      <main className="relative z-10 flex-1 px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-text-primary mb-1">Terms of Use</h1>
          <p className="text-text-muted text-xs mb-10">
            Effective {EFFECTIVE_DATE} &middot; applies to the DJ Duels web app and mobile app
          </p>

          <Section title="Accepting these terms">
            <p>
              By creating an account or using DJ Duels, you agree to these terms. If you don&apos;t agree
              with them, please don&apos;t use the service. We may update these terms; if we change
              something meaningful we&apos;ll update the effective date above.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              You need an account to play. You&apos;re responsible for keeping your password secure and
              for what happens under your account. Don&apos;t impersonate other people, and don&apos;t
              share your account with someone else.
            </p>
            <p>
              You must be at least 13 years old to use DJ Duels.
            </p>
          </Section>

          <Section title="Acceptable use — zero tolerance">
            <p>
              <span className="text-text-primary font-semibold">
                There is no tolerance for objectionable content or abusive behaviour on DJ Duels.
              </span>{' '}
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Harass, threaten, bully, or target anyone with hateful conduct</li>
              <li>Choose a username, or queue content, that is hateful, sexually explicit, or intended to offend</li>
              <li>Deliberately use tracks to harass or upset the people in a room with you</li>
              <li>Impersonate another person</li>
              <li>Spam, advertise, or attempt to defraud other players</li>
              <li>Attempt to break, overload, or gain unauthorised access to the service</li>
            </ul>
            <p>
              Accounts that break these rules can be suspended or permanently removed, without
              notice and at our discretion. We do not require a pattern of behaviour before acting
              on something serious.
            </p>
          </Section>

          <Section title="Blocking and reporting">
            <p>
              Every player can block any other player at any time. Blocking immediately ends any
              friendship or pending request between you, stops them contacting you, and removes
              their access to lounges you share.
            </p>
            <p>
              You can also report a player from the same menu, or by emailing{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-neon-blue hover:text-neon-blue/80 transition-colors">
                {SUPPORT_EMAIL}
              </a>. We review every report we receive, normally within 24 hours, and act on it —
              which can mean removing content, suspending an account, or a permanent ban.
            </p>
          </Section>

          <Section title="Music and content">
            <p>
              DJ Duels does not host, store, or stream any audio. Songs play through Spotify&apos;s and
              YouTube&apos;s own official embedded players, and your use of those players is also
              subject to Spotify&apos;s and Google&apos;s terms. Music, artwork, and metadata belong to
              their respective rights holders.
            </p>
            <p>
              Because you can play anything in those catalogues, tracks may contain explicit
              language or themes that we neither select nor control.
            </p>
          </Section>

          <Section title="The service is provided as-is">
            <p>
              DJ Duels is provided free and as-is, without warranties of any kind. We don&apos;t
              guarantee it will always be available or error-free, and we&apos;re not liable for any
              loss arising from your use of it. Nothing here limits rights you have that can&apos;t be
              limited by law.
            </p>
          </Section>

          <Section title="Ending your account">
            <p>
              You can delete your account at any time from your Profile, on the web or in the mobile
              app. That permanently removes your account, your stats, and any connected Spotify or
              YouTube accounts, and it can&apos;t be undone. We may suspend or end an account that
              breaks these terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-neon-blue hover:text-neon-blue/80 transition-colors">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Terms
