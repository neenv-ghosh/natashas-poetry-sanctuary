import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Heart, MessageSquare, Sparkles, Image, Lock, Clock, BookOpen, Edit, Trash2 } from 'lucide-react';
import { PalimpsestDocument } from '../types';

interface Book3DProps {
  document: PalimpsestDocument;
  onOpen: (docId: string, mode?: 'read' | 'edit') => void;
  onToggleFavorite?: (docId: string, e: React.MouseEvent) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
  layout?: 'shelf' | 'grid' | 'stacked';
}

export const Book3D: React.FC<Book3DProps> = ({
  document,
  onOpen,
  onToggleFavorite,
  onDeleteDocument,
  layout = 'grid',
}) => {
  // Determine physical book thickness based on word count
  const wordCount = document.wordCount || 100;
  const isThick = wordCount > 300;
  const isMedium = wordCount > 120 && wordCount <= 300;

  // Book cover color palette based on category or mood
  const getBookCoverTheme = (category: string, mood: string) => {
    switch (category.toLowerCase()) {
      case 'letters':
        return {
          bg: 'from-[#4a2e2b] via-[#3b221f] to-[#2a1715]',
          border: 'border-[#7a4e47]',
          text: 'text-[#f5e6d3]',
          accent: 'bg-[#a33b32]',
          ribbon: '#d97706',
          spinePattern: 'border-amber-700/40',
        };
      case 'journal':
      case 'dreams':
        return {
          bg: 'from-[#1e3a4e] via-[#162d3d] to-[#0f1f2c]',
          border: 'border-[#2d5675]',
          text: 'text-[#e1eff8]',
          accent: 'bg-[#2563eb]',
          ribbon: '#38bdf8',
          spinePattern: 'border-sky-700/40',
        };
      case 'comfort':
      case 'memories':
        return {
          bg: 'from-[#2e4a3b] via-[#21372c] to-[#16261e]',
          border: 'border-[#436c57]',
          text: 'text-[#e2f0e8]',
          accent: 'bg-[#059669]',
          ribbon: '#34d399',
          spinePattern: 'border-emerald-700/40',
        };
      default:
        // Poetry / default deep burgundy leather & gold foil
        return {
          bg: 'from-[#3f1d24] via-[#2f131a] to-[#200a0f]',
          border: 'border-[#612b36]',
          text: 'text-[#fceee6]',
          accent: 'bg-[#9f1239]',
          ribbon: '#fbbf24',
          spinePattern: 'border-rose-800/40',
        };
    }
  };

  const theme = getBookCoverTheme(document.category, document.mood);

  const hasAnnotations = document.annotations && document.annotations.length > 0;
  const hasPhotos = document.photos && document.photos.length > 0;
  const authorInitials = 'NG & NR';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative cursor-pointer select-none"
      onClick={() => onOpen(document.id, 'read')}
    >
      {/* Pressed Flower / Gold Bookmark Ribbon Hanging from Top */}
      {document.isFavorite && (
        <div
          className="absolute -top-3 right-6 z-20 w-4 h-12 shadow-md flex flex-col items-center pointer-events-none"
          style={{ backgroundColor: theme.ribbon }}
        >
          <div className="w-full h-full border-b-4 border-black/20" />
          <div
            className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: theme.ribbon }}
          />
        </div>
      )}

      {/* Time Capsule Sealed Badge */}
      {document.isTimeCapsule && document.unlockDate && new Date() < new Date(document.unlockDate) && (
        <div className="absolute -left-2 top-4 z-20 px-2 py-0.5 bg-rose-900 text-amber-100 font-sans text-[9px] font-bold rounded-r-md shadow-md border border-amber-400/40 flex items-center gap-1 animate-pulse">
          <Lock className="w-3 h-3 text-amber-300" />
          <span>Capsule</span>
        </div>
      )}

      {/* Sticky Note / Margin Annotation Tab protruding from book edge */}
      {hasAnnotations && (
        <div className="absolute -right-2 top-1/3 z-20 px-1.5 py-0.5 bg-amber-200 dark:bg-amber-400 text-amber-950 font-sans text-[9px] font-bold rounded-r-md shadow-sm border-l border-amber-400 flex items-center gap-1">
          <MessageSquare className="w-2.5 h-2.5" />
          <span>{document.annotations.length}</span>
        </div>
      )}

      {/* 3D Book Container */}
      <div className="relative flex shadow-xl group-hover:shadow-2xl transition-shadow rounded-r-md overflow-hidden bg-gradient-to-r from-black/80 via-transparent to-transparent p-0.5">
        
        {/* Book Spine (Left 3D Edge) */}
        <div
          className={`w-4 sm:w-5 bg-gradient-to-b ${theme.bg} border-r ${theme.border} flex flex-col justify-between items-center py-4 relative shadow-inner`}
        >
          {/* Spine Ridges / Embossing lines */}
          <div className="w-full space-y-3">
            <div className={`border-t-2 ${theme.spinePattern} w-full`} />
            <div className={`border-t-2 ${theme.spinePattern} w-full`} />
          </div>

          {/* Vertical Title on Spine */}
          <span
            className="text-[9px] font-serif font-bold uppercase tracking-widest text-amber-200/80 rotate-180 whitespace-nowrap overflow-hidden text-ellipsis max-h-32"
            style={{ writingMode: 'vertical-rl' }}
          >
            {document.title}
          </span>

          <div className="w-full space-y-3">
            <div className={`border-t-2 ${theme.spinePattern} w-full`} />
            <div className={`border-t-2 ${theme.spinePattern} w-full`} />
          </div>
        </div>

        {/* Front Cover */}
        <div
          className={`flex-1 min-h-[220px] sm:min-h-[250px] bg-gradient-to-br ${theme.bg} ${theme.border} border border-l-0 rounded-r-md p-4 flex flex-col justify-between relative overflow-hidden`}
        >
          {/* Gold Foil Ornate Border Frame */}
          <div className="absolute inset-2 border border-amber-400/20 rounded-sm pointer-events-none" />
          <div className="absolute inset-2.5 border border-amber-400/10 rounded-sm pointer-events-none" />

          {/* Cover Header */}
          <div className="relative z-10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-amber-200/60 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{document.category}</span>
              </span>
              <span>{document.sequenceIndex ? `Vol. ${document.sequenceIndex}` : 'Anthology'}</span>
            </div>

            {/* Book Title with Gold Leaf styling */}
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-amber-100 font-['Playfair_Display',serif] leading-snug line-clamp-2 pt-1">
              {document.title}
            </h3>

            {document.subtitle && (
              <p className="font-serif italic text-xs text-amber-200/70 font-['Cormorant_Garamond',serif] line-clamp-1">
                {document.subtitle}
              </p>
            )}
          </div>

          {/* Center Emblem / Initials */}
          <div className="relative z-10 my-2 self-center text-center">
            <div className="w-10 h-10 rounded-full border border-amber-400/30 bg-black/30 backdrop-blur-xs flex items-center justify-center mx-auto shadow-inner">
              <span className="font-serif text-[11px] font-bold text-amber-300 tracking-wider">
                {authorInitials}
              </span>
            </div>
            <p className="text-[9px] font-serif italic text-amber-200/60 mt-1">
              {document.dedicatedTo || 'For Natasha Raman'}
            </p>
          </div>

          {/* Cover Footer & Metadata */}
          <div className="relative z-10 pt-2 border-t border-amber-400/20 flex items-center justify-between text-[10px] font-sans text-amber-200/70">
            <span className="truncate italic font-serif max-w-[80px]">
              {document.writtenDateFormatted || new Date(document.createdDate).toLocaleDateString()}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(document.id, 'read');
                }}
                className="p-1 hover:text-amber-100 hover:bg-white/10 rounded transition-colors"
                title="Read Volume"
              >
                <BookOpen className="w-3 h-3 text-amber-200/80" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(document.id, 'edit');
                }}
                className="p-1 hover:text-amber-100 hover:bg-white/10 rounded transition-colors"
                title="Edit Stanza / Poem"
              >
                <Edit className="w-3 h-3 text-amber-200/80" />
              </button>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(document.id, e);
                  }}
                  className="p-1 hover:text-amber-100 hover:bg-white/10 rounded transition-colors"
                  title={document.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      document.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-amber-200/50'
                    }`}
                  />
                </button>
              )}

              {onDeleteDocument && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(document.id, e);
                  }}
                  className="p-1 hover:text-rose-300 hover:bg-white/10 rounded transition-colors"
                  title="Move to Trash"
                >
                  <Trash2 className="w-3 h-3 text-rose-300/70" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Physical Pages Edge Texture (Right Side Pages) */}
        <div className="w-2.5 bg-[#f3eae0] dark:bg-[#1f1a15] border-l border-[#d8ccbe] dark:border-[#383028] rounded-r-xs flex flex-col justify-around py-1 shadow-inner">
          <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
          <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
          <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
          <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full" />
        </div>
      </div>
    </motion.div>
  );
};
