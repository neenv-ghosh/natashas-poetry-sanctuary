import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Heart, BookOpen, Clock } from 'lucide-react';
import { PalimpsestDocument } from '../types';

interface MemoryLaneWidgetProps {
  documents: PalimpsestDocument[];
  onOpenDocument: (docId: string, mode?: 'read' | 'edit') => void;
}

export const MemoryLaneWidget: React.FC<MemoryLaneWidgetProps> = ({ documents, onOpenDocument }) => {
  const activeDocs = documents.filter((d) => !d.isTrash);

  // Find poem written on this exact month and day in any past year
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const sameDayPoem = activeDocs.find((doc) => {
    if (!doc.createdDate) return false;
    const docDate = new Date(doc.createdDate);
    return docDate.getMonth() === currentMonth && docDate.getDate() === currentDate;
  });

  // Fallback: Pick a favorite or random gem
  const featuredPoem =
    sameDayPoem ||
    activeDocs.find((d) => d.isFavorite || d.isPinned) ||
    activeDocs[Math.floor(Math.random() * Math.max(1, activeDocs.length))] ||
    null;

  if (!featuredPoem) return null;

  const isExactDateMatch = Boolean(sameDayPoem);

  // Extract a clean snippet from content HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = featuredPoem.content || '';
  const plainSnippet = tempDiv.textContent || tempDiv.innerText || '';
  const previewLines = plainSnippet.split('\n').filter((l) => l.trim().length > 0).slice(0, 3).join('\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-[#f8f1e5] via-[#f5ebd9] to-[#ebdcc8] dark:from-[#26201a] dark:via-[#221c17] dark:to-[#1a1512] border border-amber-700/20 dark:border-amber-600/30 shadow-md relative overflow-hidden"
    >
      {/* Decorative Background Stamp */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-amber-900 dark:text-amber-200">
        <Sparkles className="w-40 h-40" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-800/10 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-400 font-sans">
                {isExactDateMatch ? 'Memory Lane • Written On This Day' : 'Poem of the Day • Sanctuary Gem'}
              </span>
              {isExactDateMatch && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-700 text-white animate-pulse">
                  Today in History
                </span>
              )}
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1c1917] dark:text-[#ebdcc8]">
              {featuredPoem.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDocument(featuredPoem.id, 'read')}
            className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-amber-50 font-sans text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Stanza</span>
          </button>
        </div>
      </div>

      <p className="font-serif italic text-sm text-[#4a3f35] dark:text-[#c4b5a3] leading-relaxed line-clamp-3 mb-4 pl-3 border-l-2 border-amber-700/40 dark:border-amber-500/40">
        "{previewLines || featuredPoem.subtitle || 'Every word penned across midnight hours.'}"
      </p>

      <div className="flex flex-wrap items-center justify-between text-xs font-sans text-[#8c7e6b] dark:text-[#9e8f7c] pt-2 border-t border-amber-900/10 dark:border-amber-100/10 gap-2">
        <span className="flex items-center gap-1.5 font-serif italic">
          <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>
            {featuredPoem.writtenDateFormatted || new Date(featuredPoem.createdDate).toLocaleDateString()}
          </span>
        </span>

        <div className="flex items-center gap-3">
          <span className="capitalize text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-amber-900/5 dark:bg-amber-100/10">
            Mood: {featuredPoem.mood || 'Serene'}
          </span>
          {featuredPoem.isFavorite && (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <Heart className="w-3 h-3 fill-rose-600" /> Favorite
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
