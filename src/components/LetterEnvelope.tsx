import React from 'react';
import { motion } from 'motion/react';
import { Mail, Heart, Sparkles, Calendar, User, BookOpen, Edit, Trash2 } from 'lucide-react';
import { PalimpsestDocument } from '../types';

interface LetterEnvelopeProps {
  document: PalimpsestDocument;
  onOpen: (docId: string, mode?: 'read' | 'edit') => void;
  onToggleFavorite?: (docId: string, e: React.MouseEvent) => void;
  onDeleteDocument?: (docId: string, e: React.MouseEvent) => void;
}

export const LetterEnvelope: React.FC<LetterEnvelopeProps> = ({
  document,
  onOpen,
  onToggleFavorite,
  onDeleteDocument,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => onOpen(document.id, 'read')}
      className="group relative cursor-pointer select-none bg-[#fdfaf5] dark:bg-[#1e1a16] border border-[#e8dfd1] dark:border-[#383028] rounded-xl p-5 shadow-md hover:shadow-xl transition-all flex flex-col justify-between min-h-[200px]"
    >
      {/* Top Envelope Flap Triangle visual */}
      <div className="absolute top-0 inset-x-0 h-10 bg-[#f7efdf] dark:bg-[#28221c] border-b border-[#ebd2b4] dark:border-[#3a3026] rounded-t-xl opacity-80 flex items-center justify-center">
        {/* Burgundy / Amber Wax Seal in Center */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#881337] to-[#be123c] shadow-md border border-rose-300/40 flex items-center justify-center text-rose-100 font-serif font-bold text-[10px] tracking-tight transform group-hover:scale-110 transition-transform">
          N&N
        </div>
      </div>

      {/* Main Letter Front Details */}
      <div className="pt-8 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Sealed Letter</span>
          </span>
          <span className="italic font-serif font-normal text-[#8c7e6b]">
            {document.writtenDateFormatted || new Date(document.createdDate).toLocaleDateString()}
          </span>
        </div>

        <h3 className="font-serif text-lg font-bold text-[#2c241c] dark:text-[#ebdcc8] font-['Playfair_Display',serif] leading-tight group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
          {document.title}
        </h3>

        {document.subtitle && (
          <p className="font-serif italic text-xs text-[#786b58] dark:text-[#a09280] line-clamp-2">
            "{document.subtitle}"
          </p>
        )}
      </div>

      {/* Footer Envelope Bar */}
      <div className="pt-4 mt-2 border-t border-dashed border-[#e8dfd1] dark:border-[#332b22] flex items-center justify-between text-[11px] font-serif text-[#786b58] dark:text-[#a09280]">
        <span className="flex items-center gap-1 italic truncate max-w-[130px]">
          <User className="w-3 h-3 text-amber-800 shrink-0" />
          <span className="truncate">Neenv to Natasha</span>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(document.id, 'read');
            }}
            className="p-1 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            title="Read Letter"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(document.id, 'edit');
            }}
            className="p-1 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            title="Edit Letter"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(document.id, e);
              }}
              className="p-1 hover:scale-110 transition-transform"
              title={document.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  document.isFavorite ? 'text-rose-600 fill-rose-600' : 'text-[#8c7e6b]/40'
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
              className="p-1 hover:text-rose-600 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600/70" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
