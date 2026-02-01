
import { Emotion, VoiceOption } from './types';

export const EMOTIONS: { value: Emotion; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'happy', label: 'Happy' },
  { value: 'sad', label: 'Sad' },
  { value: 'excited', label: 'Excited' },
  { value: 'angry', label: 'Angry' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'calm', label: 'Calm' },
  { value: 'motivational', label: 'Motivational' },
  { value: 'storytelling', label: 'Storytelling' },
];

export const MALE_VOICES: VoiceOption[] = [
  { 
    id: 'male_fenrir', 
    label: 'Fenrir', 
    shortName: 'FEN',
    description: 'Deep, authoritative, and cinematic.', 
    gender: 'male', 
    geminiVoice: 'fenrir',
    tags: ['Cinematic', 'Authority', 'Deep'],
    technicalProfile: '24kHz Mono / High Resonance'
  },
  { 
    id: 'male_puck', 
    label: 'Puck', 
    shortName: 'PCK',
    description: 'Youthful, energetic, and bright.', 
    gender: 'male', 
    geminiVoice: 'puck',
    tags: ['Youthful', 'Upbeat', 'Friendly'],
    technicalProfile: '24kHz Mono / Low-Freq Warmth'
  },
  { 
    id: 'male_charon', 
    label: 'Charon', 
    shortName: 'CHR',
    description: 'Professional, calm, and neutral.', 
    gender: 'male', 
    geminiVoice: 'charon',
    tags: ['Corporate', 'Steady', 'Mature'],
    technicalProfile: '24kHz Mono / Balanced Mid'
  },
];

export const FEMALE_VOICES: VoiceOption[] = [
  { 
    id: 'female_kore', 
    label: 'Kore', 
    shortName: 'KOR',
    description: 'Soft, gentle, and nurturing.', 
    gender: 'female', 
    geminiVoice: 'kore',
    tags: ['Gentle', 'Soft', 'Meditation'],
    technicalProfile: '24kHz Mono / High Clarity'
  },
  { 
    id: 'female_zephyr', 
    label: 'Zephyr', 
    shortName: 'ZPH',
    description: 'Modern, clear, and expressive.', 
    gender: 'female', 
    geminiVoice: 'zephyr',
    tags: ['Modern', 'Podcast', 'Sharp'],
    technicalProfile: '24kHz Mono / Crisp Highs'
  },
  { 
    id: 'female_aoede', 
    label: 'Aoede', 
    shortName: 'AOE',
    description: 'Sophisticated, mature, and rich.', 
    gender: 'female', 
    geminiVoice: 'aoede',
    tags: ['Narrative', 'Elegant', 'Deep'],
    technicalProfile: '24kHz Mono / Natural Reverb'
  },
];

export const ALL_VOICES = [...MALE_VOICES, ...FEMALE_VOICES];
