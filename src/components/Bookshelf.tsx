import React from 'react';
import { Book3D } from './Book3D';
import { LetterEnvelope } from './LetterEnvelope';
import { PalimpsestDocument } from '../types';
import { Sparkles, BookOpen } from 'lucide-react';

interface BookshelfProps {
  title: string;
  subtitle?: string;
  documents: PalimpsestDocument[];
  onOpenDocument: (docId: string, mode?: 'read' | 'edit') => void;
  onToggleFavorite?: (docId: string, e: React.MouseEvent) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
  accentColor?: string;
  emptyStateText?: string;
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  title,
  subtitle,
  documents,
  onOpenDocument,
  onToggleFavorite,
  onDeleteDocument,
  accentColor = '#b45309',
  emptyStateText = 'This shelf is waiting for its first story from Neenv.',
}) => {
  return (
    <div className="space-y-4">
      {/* Wooden Bookshelf Header with Brass Plate */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#d6c4ae] dark:border-[#382f25] pb-3 gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/20"
            style={{ backgroundColor: accentColor }}
          />
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2c241c] dark:text-[#ebdcc8] font-['Playfair_Display',serif] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="font-serif italic text-xs text-[#786b58] dark:text-[#a09280]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <span className="text-xs font-sans uppercase tracking-widest text-amber-900/70 dark:text-amber-400/80 font-bold self-start sm:self-auto px-2.5 py-1 bg-[#efe6d8] dark:bg-[#251f19] rounded-md border border-[#dfd5c5] dark:border-[#332a22]">
          {documents.length} {documents.length === 1 ? 'Volume' : 'Volumes'}
        </span>
      </div>

      {/* Bookshelf Wooden Planks Structure */}
      <div className="bg-gradient-to-b from-[#f3eae0] via-[#ebe0d3] to-[#e4d6c6] dark:from-[#211c18] dark:via-[#1a1613] dark:to-[#15120f] border border-[#d8c8b6] dark:border-[#332a22] rounded-2xl p-6 shadow-lg relative overflow-hidden">
        
        {/* Wood grain subtle background texture lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#8c7e6b_1px,transparent_1px)] [background-size:16px_16px]" />

        {documents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-amber-800/40 mx-auto" />
            <p className="font-serif italic text-sm text-[#786b58] dark:text-[#a09280]">
              "{emptyStateText}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10 pb-4">
            {documents.map((doc) => {
              if (doc.category.toLowerCase() === 'letters') {
                return (
                  <LetterEnvelope
                    key={doc.id}
                    document={doc}
                    onOpen={onOpenDocument}
                    onToggleFavorite={onToggleFavorite}
                    onDeleteDocument={onDeleteDocument}
                  />
                );
              }
              return (
                <Book3D
                  key={doc.id}
                  document={doc}
                  onOpen={onOpenDocument}
                  onToggleFavorite={onToggleFavorite}
                  onDeleteDocument={onDeleteDocument}
                />
              );
            })}
          </div>
        )}

        {/* Physical Wood Shelf Planks Bottom Border Effect */}
        <div className="h-4 bg-gradient-to-r from-[#a37f5d] via-[#be9874] to-[#a37f5d] dark:from-[#3a2c20] dark:via-[#4d3b2b] dark:to-[#3a2c20] -mx-6 -mb-6 mt-2 border-t-2 border-[#8c6747] dark:border-[#281e16] shadow-md flex items-center justify-between px-6">
          <div className="w-8 h-1.5 bg-[#694e35] dark:bg-[#1a130e] rounded-xs shadow-inner" />
          <div className="w-8 h-1.5 bg-[#694e35] dark:bg-[#1a130e] rounded-xs shadow-inner" />
        </div>
      </div>
    </div>
  );
};
