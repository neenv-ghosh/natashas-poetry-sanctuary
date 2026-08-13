export type DocumentStatus = 'draft' | 'published' | 'archived';

export type PermissionType = 'private' | 'shared' | 'readonly' | 'collaborative';

export type CollectionCategory =
  | 'poetry'
  | 'letters'
  | 'dreams'
  | 'journal'
  | 'comfort'
  | 'anniversaries'
  | 'christmas'
  | 'future'
  | 'memories'
  | string;

export interface AuthorProfile {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  penColor: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Reply {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
}

export interface Annotation {
  id: string;
  docId: string;
  selectedText: string;
  comment: string;
  authorId: string;
  createdAt: string;
  color: string;
  resolved: boolean;
  replies: Reply[];
  paragraphIndex?: number;
  highlightRange?: { from: number; to: number };
}

export interface Bookmark {
  id: string;
  docId: string;
  paragraphIndex?: number;
  textSnippet: string;
  note?: string;
  authorId: string;
  createdAt: string;
}

export interface ParagraphReaction {
  id: string;
  paragraphIndex: number;
  emoji: '❤️' | '⭐' | '🌙' | '🦋' | '🌻' | '📖' | string;
  authorId: string;
  createdAt: string;
}

export interface DocumentVersion {
  versionNumber: number;
  authorId: string;
  timestamp: string;
  changeSummary: string;
  title: string;
  subtitle?: string;
  content: string; // HTML content
}

export interface PhotoMemory {
  id: string;
  url: string;
  caption?: string;
  date?: string;
  location?: string;
}

export interface Collection {
  id: string;
  name: string;
  category: CollectionCategory;
  iconName: string; // Lucide icon identifier
  color: string; // Hex or tailwind color
  description: string;
  isCustom?: boolean;
  isAnthology?: boolean; // For 3-4 poem suites/collections
  coverPhoto?: string;
  dedication?: string;
  dateRange?: string;
  poemIds?: string[]; // Order of poems in suite
}

export interface PalimpsestDocument {
  id: string;
  title: string;
  subtitle?: string;
  content: string; // HTML formatted string
  authorId: string;
  coAuthorId?: string;
  createdDate: string;
  modifiedDate: string;
  writtenDateFormatted?: string; // e.g. "October 14, 2025" or "Rainy Tuesday Afternoon"
  poetNote?: string; // Personal note from Neenv about this poem
  natashaReflection?: string; // Natasha's notes and thoughts
  dedicatedTo?: string; // e.g. "For Natasha Raman"
  photos?: PhotoMemory[]; // Attached photo memories
  collectionId?: string; // Belongs to an anthology or collection
  sequenceIndex?: number; // 1 of 4, 2 of 4, etc.
  category: CollectionCategory;
  mood: string; // e.g. "Nostalgic", "Luminous", "Melancholic", "Serene", "Passionate", "Wistful"
  tags: string[];
  favoriteQuote?: string;
  readingTimeMinutes: number;
  wordCount: number;
  characterCount: number;
  coverImage?: string;
  backgroundMusic?: 'rain' | 'library' | 'night' | 'cafe' | 'piano' | 'none';
  status: DocumentStatus;
  permission: PermissionType;
  fontStyle: string; // Font family name e.g. "Cormorant Garamond"
  fontSize: number; // pt size e.g. 18
  isPinned: boolean;
  isFavorite: boolean;
  isTrash?: boolean;
  isTimeCapsule?: boolean;
  unlockDate?: string; // ISO date string e.g. "2026-10-14"
  timeCapsuleUnlockDate?: string; // Added to fix RichEditor.tsx TypeScript error
  versions: DocumentVersion[];
  annotations: Annotation[];
  reactions: ParagraphReaction[];
  bookmarks: Bookmark[];
}

export interface UserPresenceState {
  user: AuthorProfile;
  activePoemId: string | null;
  activePoemTitle?: string | null;
  currentView?: string;
  isTyping?: boolean;
  typingTarget?: string;
  lastSeen?: string;
}

export interface LiveReactionPing {
  id: string;
  emoji: string;
  fromUser: string;
  poemId: string;
  poemTitle?: string;
  timestamp: number;
}

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'library' | 'night' | 'rain' | 'christmas';

export type AmbientSoundType =
  | 'none'
  | 'rain'
  | 'library'
  | 'night'
  | 'cafe'
  | 'piano'
  | 'waves'
  | 'fireplace'
  | 'forest';

export interface UserStats {
  totalPoems: number;
  totalWords: number;
  longestPoemTitle: string;
  longestPoemWordCount: number;
  writingStreakDays: number;
  mostAnnotatedPoemTitle: string;
  mostAnnotatedCount: number;
  favoriteCollection: string;
  totalReadingMinutes: number;
  dailyWordHistory: { date: string; wordCount: number }[];
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'script';
  description: string;
  isCustom?: boolean;
}