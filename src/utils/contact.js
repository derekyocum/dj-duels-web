// Single source of truth for the published support address. It appears in the
// privacy policy, the support page, the footer, the mobile app, and the App
// Store listing -- Apple checks that the Support URL actually reaches a human,
// so these must not be allowed to drift apart.
export const SUPPORT_EMAIL = 'support.djduels@gmail.com'

// Prefilled subject/body so a bug report arrives with the details we'd
// otherwise have to ask for in a round trip.
export function supportMailto({ subject = 'DJ Duels support', body = '' } = {}) {
  const params = new URLSearchParams({ subject, ...(body ? { body } : {}) })
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`
}
