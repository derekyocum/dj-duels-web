import {
  VinylIcon, HeadphonesIcon, MicrophoneIcon, SpeakerIcon, TurntableIcon, MixerIcon,
  BoomboxIcon, CassetteIcon, GuitarIcon, RadioIcon, PianoIcon, SoundwaveIcon,
  TrumpetIcon, SaxophoneIcon, DrumKitIcon, ViolinIcon, SynthIcon, TambourineIcon,
} from '../components/AvatarIcons'

// Cycles through the same 7-color neon palette LoungeAvatar already uses
// (see duelUtils.js's PLAYER_COLORS) rather than inventing new tokens --
// keeps every avatar option using colors already safelisted by Tailwind
// elsewhere in the app. ids must match the backend's StatsController
// VALID_AVATARS whitelist exactly.
export const AVATAR_OPTIONS = [
  { id: 'vinyl', label: 'Vinyl record', Icon: VinylIcon, color: 'neon-blue' },
  { id: 'headphones', label: 'Headphones', Icon: HeadphonesIcon, color: 'neon-pink' },
  { id: 'microphone', label: 'Microphone', Icon: MicrophoneIcon, color: 'neon-purple' },
  { id: 'speaker', label: 'Speaker', Icon: SpeakerIcon, color: 'neon-green' },
  { id: 'turntable', label: 'Turntable', Icon: TurntableIcon, color: 'neon-yellow' },
  { id: 'mixer', label: 'Mixer', Icon: MixerIcon, color: 'neon-orange' },
  { id: 'boombox', label: 'Boombox', Icon: BoomboxIcon, color: 'neon-cyan' },
  { id: 'cassette', label: 'Cassette tape', Icon: CassetteIcon, color: 'neon-blue' },
  { id: 'guitar', label: 'Guitar', Icon: GuitarIcon, color: 'neon-pink' },
  { id: 'radio', label: 'Radio', Icon: RadioIcon, color: 'neon-purple' },
  { id: 'piano', label: 'Piano keys', Icon: PianoIcon, color: 'neon-green' },
  { id: 'soundwave', label: 'Soundwave', Icon: SoundwaveIcon, color: 'neon-yellow' },
  { id: 'trumpet', label: 'Trumpet', Icon: TrumpetIcon, color: 'neon-orange' },
  { id: 'saxophone', label: 'Saxophone', Icon: SaxophoneIcon, color: 'neon-cyan' },
  { id: 'drumkit', label: 'Drum kit', Icon: DrumKitIcon, color: 'neon-blue' },
  { id: 'violin', label: 'Violin', Icon: ViolinIcon, color: 'neon-pink' },
  { id: 'synth', label: 'Synthesizer', Icon: SynthIcon, color: 'neon-purple' },
  { id: 'tambourine', label: 'Tambourine', Icon: TambourineIcon, color: 'neon-green' },
]

export const avatarById = (id) => AVATAR_OPTIONS.find((a) => a.id === id) ?? null

// The same 7-color neon palette every avatar option draws from, exposed on
// its own for the initials-letter color picker (Profile lets you pick one of
// these directly when you're not using an icon).
export const COLOR_OPTIONS = [
  'neon-blue', 'neon-pink', 'neon-purple', 'neon-green', 'neon-yellow', 'neon-orange', 'neon-cyan',
]

// Same literal-class-string idiom throughout (Tailwind needs the full class
// string present in source, not built via interpolation) -- centralized here
// since every avatar-rendering surface in the app (picker grid, Profile
// header, duel roster, lounge presence, leaderboard, friends list) needs the
// same four maps rather than each keeping its own copy.
export const AVATAR_BG = {
  'neon-blue': 'bg-neon-blue/20', 'neon-pink': 'bg-neon-pink/20', 'neon-purple': 'bg-neon-purple/20',
  'neon-green': 'bg-neon-green/20', 'neon-yellow': 'bg-neon-yellow/20', 'neon-orange': 'bg-neon-orange/20',
  'neon-cyan': 'bg-neon-cyan/20',
}
export const AVATAR_BORDER = {
  'neon-blue': 'border-neon-blue/50', 'neon-pink': 'border-neon-pink/50', 'neon-purple': 'border-neon-purple/50',
  'neon-green': 'border-neon-green/50', 'neon-yellow': 'border-neon-yellow/50', 'neon-orange': 'border-neon-orange/50',
  'neon-cyan': 'border-neon-cyan/50',
}
export const AVATAR_TEXT = {
  'neon-blue': 'text-neon-blue', 'neon-pink': 'text-neon-pink', 'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green', 'neon-yellow': 'text-neon-yellow', 'neon-orange': 'text-neon-orange',
  'neon-cyan': 'text-neon-cyan',
}
export const AVATAR_DOT = {
  'neon-blue': 'bg-neon-blue', 'neon-pink': 'bg-neon-pink', 'neon-purple': 'bg-neon-purple',
  'neon-green': 'bg-neon-green', 'neon-yellow': 'bg-neon-yellow', 'neon-orange': 'bg-neon-orange',
  'neon-cyan': 'bg-neon-cyan',
}
