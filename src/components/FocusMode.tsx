import React from 'react';
import { motion } from 'motion/react';
import { Minimize2, Feather, Sparkles } from 'lucide-react';
import { PalimpsestDocument, AuthorProfile, AmbientSoundType } from '../types';
import { AmbientAudioWidget } from './AmbientAudioWidget';

interface FocusModeProps {
  document: PalimpsestDocument;
  currentAuthor: AuthorProfile;
  onUpdateDocument: (updated: PalimpsestDocument) => void;
  onExit: () => void;
  ambientSound: AmbientSoundType;
  onChangeAmbientSound: (type: AmbientSoundType) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  document,
  currentAuthor,
  onUpdateDocument,
  onExit,
  ambientSound,
  onChangeAmbientSound,
}) => {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawText = e.target.value;
    const words = rawText.trim().split(/\s+/).filter(Boolean).length;
    const chars = rawText.length;
    const readingMin = Math.max(1, Math.ceil(words / 200));

    // Wrap plain text paragraphs into HTML
    const htmlContent = rawText
      .split('\n\n')
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('');

    onUpdateDocument({
      ...document,
      content: htmlContent,
      wordCount: words,
      characterCount: chars,
      readingTimeMinutes: readingMin,
    });
  };

  // Convert HTML back to editable plain text for focus mode
  const getPlainText = () => {
    const temp = window.document.createElement('div');
    temp.innerHTML = document.content;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#161310] text-[#e0d6c5] flex flex-col font-serif select-text overflow-hidden"
    >
      {/* Top Floating Controls */}
      <div className="flex items-center justify-between px-8 py-4 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-amber-200/70">
          <Feather className="w-4 h-4" />
          <span>Focus Mode &bull; {currentAuthor.name}</span>
        </div>

        <div className="flex items-center gap-4">
          <AmbientAudioWidget
            compact
            currentSound={ambientSound}
            onChangeSound={onChangeAmbientSound}
          />

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-700/40 text-amber-200 text-xs font-sans hover:bg-amber-900 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus</span>
          </button>
        </div>
      </div>

      {/* Central Distraction Free Writing Canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <input
            type="text"
            value={document.title}
            onChange={(e) => onUpdateDocument({ ...document, title: e.target.value })}
            placeholder="Untitled Stanza"
            className="w-full bg-transparent font-serif font-bold text-4xl text-[#f3e7d3] focus:outline-none placeholder-amber-900/40 font-['Playfair_Display',serif]"
          />

          <textarea
            defaultValue={getPlainText()}
            onChange={handleContentChange}
            placeholder="Write freely in the quiet dark..."
            rows={20}
            className="w-full bg-transparent font-serif text-xl leading-relaxed text-[#d6c7b2] focus:outline-none resize-none placeholder-amber-900/30 font-['Cormorant_Garamond',serif]"
          />
        </div>
      </div>

      {/* Footer Minimal Stats */}
      <div className="px-8 py-3 text-center text-xs font-sans text-amber-200/40 opacity-50 hover:opacity-100 transition-opacity">
        {document.wordCount} words &bull; ~{document.readingTimeMinutes} min read
      </div>
    </motion.div>
  );
};
