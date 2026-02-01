
export type Emotion = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'angry'
  | 'romantic'
  | 'calm'
  | 'motivational'
  | 'storytelling';

export interface VoiceOption {
  id: string;
  label: string;
  shortName: string;
  description: string;
  gender: 'male' | 'female';
  geminiVoice: string;
  tags: string[];
  technicalProfile: string;
}

export interface GeneratedSpeech {
  id: string;
  text: string;
  emotion: Emotion;
  voiceLabel: string;
  audioUrl: string;
  timestamp: number;
  wordCount: number;
  durationEstimate: string;
  type: 'solo' | 'podcast';
}

export interface PodcastSpeaker {
  name: string;
  voice: VoiceOption;
  emotion: Emotion;
}
