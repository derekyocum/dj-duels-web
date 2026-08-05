import {
  VinylIcon, HeadphonesIcon, MicrophoneIcon, SpeakerIcon, TurntableIcon, MixerIcon,
  BoomboxIcon, CassetteIcon, GuitarIcon, RadioIcon, PianoIcon, SoundwaveIcon,
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
]

export const avatarById = (id) => AVATAR_OPTIONS.find((a) => a.id === id) ?? null

// Same literal-class-string idiom as LoungeAvatar.jsx's BG/BORDER/TEXT maps
// (Tailwind needs the full class string present in source, not built via
// interpolation) -- pulled out here since both the picker grid and Profile's
// header circle need them.
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
