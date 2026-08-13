import React, { useState } from 'react';
import { Search, X, Feather, Tag, MessageSquare, BookOpen, Clock } from 'lucide-react';
import { PalimpsestDocument, AuthorProfile } from '../types';

interface SearchModalProps {
  documents: PalimpsestDocument[];
  authors: AuthorProfile[];
  onSelectDocument: (docId: string) => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  documents,
  authors,
  onSelectDocument,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const activeDocs = documents.filter((d) => !d.isTrash);

  const filteredDocs = activeDocs.filter((doc) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(q);
    const subtitleMatch = doc.subtitle?.toLowerCase().includes(q);
    const contentMatch = doc.content.toLowerCase().includes(q);
    const tagMatch = doc.tags.some((t) => t.toLowerCase().includes(q));
    const moodMatch = doc.mood.toLowerCase().includes(q);
    const collectionMatch = doc.category.toLowerCase().includes(q);
    const annMatch = doc.annotations?.some(
      (a) => a.comment.toLowerCase().includes(q) || a.selectedText.toLowerCase().includes(q)
    );

    return (
      titleMatch ||
      subtitleMatch ||
      contentMatch ||
      tagMatch ||
      moodMatch ||
      collectionMatch ||
      annMatch
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#383028] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden font-serif">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e8dfd1] dark:border-[#332c24] bg-[#f7f2e8] dark:bg-[#25201b]">
          <Search className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manuscripts, body text, tags, margin notes..."
            autoFocus
            className="flex-1 bg-transparent text-sm font-serif text-[#1c1917] dark:text-[#f3e7d3] focus:outline-none placeholder-[#8c7e6b]"
          />
          <button onClick={onClose} className="p-1 hover:bg-[#eae0d0] dark:hover:bg-[#342d25] rounded">
            <X className="w-4 h-4 text-[#786b58]" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2 text-xs">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-[#8c7e6b]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No stanzas or letters match "{query}".</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const docAuthor = authors.find((a) => a.id === doc.authorId);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument(doc.id);
                    onClose();
                  }}
                  className="p-3 bg.fdfbf7 dark:bg-[#181512] border border-[#e8dfd1] dark:border-[#332c24] hover:border-amber-800/50 rounded-xl transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-[#1c1917] dark:text-[#ebdcc8] group-hover:text-amber-900 dark:group-hover:text-amber-300 font-['Playfair_Display',serif]">
                      {doc.title}
                    </div>
                    <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-amber-900/10 text-amber-900 dark:text-amber-300">
                      {doc.category}
                    </span>
                  </div>

                  {doc.subtitle && (
                    <p className="italic text-xs text-[#786b58] dark:text-[#a09280]">
                      {doc.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[10px] font-sans text-[#8c7e6b] pt-1">
                    <span>Penned by {docAuthor?.name || 'Co-author'}</span>
                    <span>&bull;</span>
                    <span>Mood: {doc.mood}</span>
                    <span>&bull;</span>
                    <span>{doc.wordCount} words</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
