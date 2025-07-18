export interface Memory {
  id: string;
  text: string;
  emotion: EmotionType;
  userId: string;
  createdAt: string;
  people: Person[];
  places: Place[];
  photos: Photo[];
  linkedMemories: string[];
  date: string;
}

export interface Person {
  id: string;
  name: string;
  relationship?: string;
}

export interface Place {
  id: string;
  name: string;
  type?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
}

export type EmotionType = 'joy' | 'sadness' | 'love' | 'anger' | 'fear' | 'surprise' | 'neutral';

export const EMOTION_COLORS = {
  joy: '#FEF08A',
  sadness: '#93C5FD',
  love: '#F9A8D4',
  anger: '#FCA5A5',
  fear: '#C4B5FD',
  surprise: '#FDE68A',
  neutral: '#D1D5DB'
};

export const EMOTION_LABELS = {
  joy: 'Joy',
  sadness: 'Sadness',
  love: 'Love',
  anger: 'Anger',
  fear: 'Fear',
  surprise: 'Surprise',
  neutral: 'Neutral'
};