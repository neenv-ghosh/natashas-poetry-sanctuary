import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  BookOpen,
  Volume2,
  Bookmark,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Heart,
  Lock,
  Clock,
  Hourglass,
} from 'lucide-react';
import { PalimpsestDocument, AuthorProfile, AmbientSoundType } from '../types';
import { AmbientAudioWidget } from './AmbientAudioWidget';

interface ReadingModeProps {
  document: PalimpsestDocument;
  authors: AuthorProfile[];
  allDocuments: PalimpsestDocument[];
  onSelectDocument: (docId: string) => void;
  onExit: () => void;
  ambientSound: AmbientSoundType;
  onChangeAmbientSound: (type: AmbientSoundType) => void;
  onToggleBookmark: (textSnippet: string) => void;
}

export const ReadingMode: React.FC<ReadingModeProps> = ({
  document,
  authors,
  allDocuments,
  onSelectDocument,
  onExit,
  ambientSound,
  onChangeAmbientSound,
  onToggleBookmark,
}) => {
  const [fontSize, setFontSize] = useState(22);
  const [paperTexture, setPaperTexture] = useState<'parchment' | 'ivory' | 'night'>('parchment');

  const currentIndex = allDocuments.findIndex((d) => d.id === document.id);
  const prevDoc = currentIndex > 0 ? allDocuments[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocuments.length - 1 ? allDocuments[currentIndex + 1] : null;

  const docAuthor = authors.find((a) => a.id === document.authorId) || authors[0];

  const getBgClass = () => {
    switch (paperTexture) {
      case 'parchment':
        return 'bg-[#fcf7ed] text-[#2c241c] border-[#ebdcc8]';
      case 'ivory':
        return 'bg-[#ffffff] text-[#1c1917] border-[#e7e5e4]';
      case 'night':
        return 'bg-[#181512] text-[#e0d6c5] border-[#2f2720]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col ${getBgClass()} transition-colors duration-500 overflow-hidden font-serif`}
    >
      {/* Physical Gold Ribbon Bookmark Hanging from Top Right */}
      <button
        onClick={() => onToggleBookmark(document.title)}
        className="absolute top-0 right-16 z-30 w-6 h-20 bg-gradient-to-b from-amber-500 to-amber-700 shadow-xl hover:h-24 transition-all duration-300 flex flex-col items-center justify-end pb-2 group"
        title={document.isFavorite ? 'Bookmarked as Favorite' : 'Bookmark this Volume'}
      >
        <Heart className={`w-3.5 h-3.5 ${document.isFavorite ? 'text-rose-100 fill-rose-100' : 'text-amber-100/70'}`} />
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#fcf7ed] dark:border-b-[#181512] absolute -bottom-0.5" />
      </button>

      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/10 dark:border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-sans font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close Reading Mode</span>
          </button>

          <span className="text-xs font-sans opacity-60">|</span>

          <span className="font-serif italic text-xs opacity-80">
            {document.title} &bull; Written by Neenv for {document.dedicatedTo || 'Natasha'}
          </span>
        </div>

        {/* Paper texture & Ambient audio controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => setPaperTexture('parchment')}
              className={`px-2 py-0.5 rounded-full ${
                paperTexture === 'parchment' ? 'bg-amber-900 text-amber-100 font-bold' : 'opacity-70'
              }`}
            >
              Parchment
            </button>
            <button
              onClick={() => setPaperTexture('ivory')}
              className={`px-2 py-0.5 rounded-full ${
                paperTexture === 'ivory' ? 'bg-neutral-800 text-white font-bold' : 'opacity-70'
              }`}
            >
              Ivory
            </button>
            <button
              onClick={() => setPaperTexture('night')}
              className={`px-2 py-0.5 rounded-full ${
                paperTexture === 'night' ? 'bg-amber-500 text-black font-bold' : 'opacity-70'
              }`}
            >
              Night
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize(Math.max(16, fontSize - 2))}
              className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs"
            >
              A+
            </button>
          </div>

          <AmbientAudioWidget
            compact
            currentSound={ambientSound}
            onChangeSound={onChangeAmbientSound}
          />
        </div>
      </div>

      {/* Main Reading Page Area */}
      <div className="flex-1 overflow-y-auto px-6 py-12 md:py-20 flex justify-center relative">
        {/* Previous page arrow */}
        {prevDoc && (
          <button
            onClick={() => onSelectDocument(prevDoc.id)}
            className="fixed left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all opacity-60 hover:opacity-100"
            title={`Previous: ${prevDoc.title}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next page arrow */}
        {nextDoc && (
          <button
            onClick={() => onSelectDocument(nextDoc.id)}
            className="fixed right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all opacity-60 hover:opacity-100"
            title={`Next: ${nextDoc.title}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <motion.article
          key={document.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl space-y-8 select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* Title Header */}
          <header className="text-center space-y-3 pb-8 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-[0.2em] opacity-70 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{document.category} &bull; {document.mood}</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight font-['Playfair_Display',serif]">
              {document.title}
            </h1>

            {document.subtitle && (
              <p className="italic text-lg md:text-xl opacity-80 font-['Cormorant_Garamond',serif]">
                {document.subtitle}
              </p>
            )}

            <div className="text-xs italic opacity-80 pt-2 font-sans flex flex-col items-center gap-1">
              <span>Written by <strong>Neenv</strong> for <strong>{document.dedicatedTo || 'Natasha'}</strong></span>
              {document.writtenDateFormatted && (
                <span className="text-[11px] font-serif not-italic opacity-70 text-amber-900 dark:text-amber-300">
                  {document.writtenDateFormatted}
                </span>
              )}
            </div>
          </header>

          {/* Poet's Personal Note from Neenv */}
          {document.poetNote && (
            <div className="p-5 my-6 rounded-2xl bg-amber-900/10 dark:bg-amber-500/15 border border-amber-800/20 text-xs font-serif italic space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold not-italic font-sans text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Poet’s Note from Neenv:</span>
              </div>
              <p className="text-sm opacity-95 leading-relaxed font-['Cormorant_Garamond',serif]">
                "{document.poetNote}"
              </p>
            </div>
          )}

          {/* Attached Photo Memories in Reading Mode */}
          {document.photos && document.photos.length > 0 && (
            <div className="my-8 space-y-3">
              <div className="text-xs font-sans uppercase tracking-widest font-bold opacity-60 text-center">
                Photo Keepsakes ({document.photos.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {document.photos.map((p) => (
                  <div key={p.id} className="p-3 bg-white dark:bg-[#201c18] border border-black/10 dark:border-white/10 rounded-xl shadow-md space-y-2">
                    <div className="aspect-4/3 rounded-lg overflow-hidden bg-black/10">
                      <img src={p.url} alt={p.caption || 'Memory'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    {p.caption && <p className="italic text-xs opacity-90 text-center font-serif">"{p.caption}"</p>}
                    {p.date && <p className="text-[10px] font-sans text-center opacity-60">{p.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body Content */}
          {document.isTimeCapsule && document.unlockDate && new Date() < new Date(document.unlockDate) ? (
            <div className="p-8 rounded-3xl bg-amber-900/10 dark:bg-amber-400/10 border-2 border-dashed border-amber-800/30 text-center space-y-4 my-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-800/20 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-amber-950 dark:text-amber-100">
                  Time Capsule Sealed
                </h3>
                <p className="font-serif italic text-base text-amber-900/80 dark:text-amber-200/80 max-w-md mx-auto leading-relaxed">
                  This poem was written by Neenv as a time-capsule keepsake for Natasha. It is sealed in the sanctuary until{' '}
                  <strong className="not-italic font-bold text-amber-950 dark:text-amber-50">
                    {new Date(document.unlockDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </strong>.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900 text-amber-100 text-xs font-sans font-semibold shadow-md">
                <Clock className="w-4 h-4 animate-spin-slow" />
                <span>Counting down to unlock day... ⏳</span>
              </div>
            </div>
          ) : (
            <div
              className="leading-relaxed font-serif tracking-normal space-y-6 font-['Cormorant_Garamond',serif]"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          )}

          {/* Natasha's Personal Reflection */}
          {document.natashaReflection && (
            <div className="p-5 my-8 rounded-2xl bg-rose-950/10 dark:bg-rose-500/15 border border-rose-800/20 text-xs font-serif italic space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-rose-950 dark:text-rose-300 font-bold not-italic font-sans text-[11px] uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                <span>Natasha’s Reflection:</span>
              </div>
              <p className="text-sm opacity-95 leading-relaxed font-['Cormorant_Garamond',serif]">
                "{document.natashaReflection}"
              </p>
            </div>
          )}

          {/* Margin Quote Box if available */}
          {document.favoriteQuote && (
            <div className="my-8 p-6 border-y border-amber-800/20 italic text-center text-xl font-['Cormorant_Garamond',serif] opacity-90">
              "{document.favoriteQuote}"
            </div>
          )}

          {/* Annotations Footer */}
          {document.annotations && document.annotations.length > 0 && (
            <footer className="pt-12 mt-12 border-t border-black/10 dark:border-white/10 space-y-4">
              <div className="text-xs font-sans uppercase tracking-widest font-bold opacity-60">
                Marginalia & Comments ({document.annotations.length})
              </div>
              <div className="space-y-3">
                {document.annotations.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs">
                    <span className="italic font-bold">"{ann.selectedText}"</span>
                    <p className="mt-1 opacity-90">{ann.comment}</p>
                  </div>
                ))}
              </div>
            </footer>
          )}
        </motion.article>
      </div>
    </motion.div>
  );
};
