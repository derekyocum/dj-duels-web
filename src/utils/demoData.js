import { PLAYER_COLORS } from './duelUtils'

export const DEMO_PLAYERS = [
  { name: 'You (Host)', color: PLAYER_COLORS[0], isHost: true },
  { name: 'MC Thunder', color: PLAYER_COLORS[1], isHost: false },
  { name: 'BeatDropper', color: PLAYER_COLORS[2], isHost: false },
  { name: 'VinylQueen', color: PLAYER_COLORS[3], isHost: false },
]

export const DEMO_TRACKS = {
  'MC Thunder': [
    {
      id: '0wXuerDYiBnERgIpbb3JBR',
      name: 'Redbone',
      artist: 'Childish Gambino',
      album: '"Awaken, My Love!"',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273b6b1fa564ffea9321e9e253b',
      durationMs: 327000,
      source: 'spotify',
    },
    {
      id: '3n3Ppam7vgaVa1iaRUc9Lp',
      name: 'Mr. Brightside',
      artist: 'The Killers',
      album: 'Hot Fuss',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273ccdddd46119a4ff53eaf1f5a',
      durationMs: 222000,
      source: 'spotify',
    },
  ],
  'BeatDropper': [
    {
      id: '7GhIk7Il098yCjg4BQjzvb',
      name: 'Get Lucky',
      artist: 'Daft Punk',
      album: 'Random Access Memories',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937',
      durationMs: 369000,
      source: 'spotify',
    },
    {
      id: '32OlwWuMpZ6b0aN2RZOeMS',
      name: 'Uptown Funk',
      artist: 'Mark Ronson ft. Bruno Mars',
      album: 'Uptown Special',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273e419ccba0baa8bd3f3d7abf2',
      durationMs: 270000,
      source: 'spotify',
    },
  ],
  'VinylQueen': [
    {
      id: '1zi7xx7UVEFkmKfv06H8x0',
      name: 'One More Time',
      artist: 'Daft Punk',
      album: 'Discovery',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b273b33d46dfa2f4264e0bfcb78a',
      durationMs: 320000,
      source: 'spotify',
    },
    {
      id: '6habFhsOp2NvshLv26DqMb',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      durationMs: 200000,
      source: 'spotify',
    },
  ],
}

export function buildBracket(players) {
  return {
    semifinals: [
      { player1: players[0], player2: players[1], matchIndex: 0 },
      { player1: players[2], player2: players[3], matchIndex: 1 },
    ],
    final: null,
    results: [],
    trackHistory: {},
  }
}
