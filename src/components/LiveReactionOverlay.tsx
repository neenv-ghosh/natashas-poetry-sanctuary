import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles } from 'lucide-react';
import { LiveReactionPing } from '../types';

interface LiveReactionOverlayProps {
  poemId: string;
  poemTitle: string;
  currentAuthorName: string;
  onSendReaction: (emoji: string) => void;
  recentReactions: LiveReactionPing[];
  isRightPanelOpen?: boolean;
}

const EMOJI_OPTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '✨', label: 'Magic' },
  { emoji: '👏', label: 'Applaud' },
  { emoji: '🌧️', label: 'Rain' },
  { emoji: '🕊️', label: 'Peace' },
  { emoji: '🕯️', label: 'Hearth' },
];

export const LiveReactionOverlay: React.FC<LiveReactionOverlayProps> = ({
  poemId,
  poemTitle,
  currentAuthorName,
  onSendReaction,
  recentReactions,
  isRightPanelOpen = false,
}) => {
  const [activeFlyingEmojis, setActiveFlyingEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const lastProcessedIdRef = useRef<string | null>(null);

  // Helper to fire floating emoji and emoji particle confetti
  const spawnReactionEffects = (emoji: string) => {
    // 1. Spawn floating Motion emoji
    const flyingId = 'fly-' + Date.now() + '-' + Math.random();
    const randomLeft = 20 + Math.random() * 60; // 20% to 80% width
    setActiveFlyingEmojis((prev) => [...prev, { id: flyingId, emoji, left: randomLeft }]);

    setTimeout(() => {
      setActiveFlyingEmojis((prev) => prev.filter((item) => item.id !== flyingId));
    }, 2200);

    // 2. Trigger particle burst using the exact emoji shape
    try {
      const emojiShape = confetti.shapeFromText({ text: emoji, scalar: 3 });
      confetti({
        particleCount: 18,
        spread: 60,
        origin: { y: 0.8 },
        shapes: [emojiShape],
        scalar: 2,
      });
    } catch (e) {
      // Fallback standard particle burst if shapeFromText is unsupported
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#b45309', '#e11d48', '#d97706', '#f59e0b'],
      });
    }
  };

  // Listen for incoming reactions from partner (or real-time stream)
  useEffect(() => {
    if (!recentReactions || recentReactions.length === 0) return;

    const latest = recentReactions[recentReactions.length - 1];
    if (!latest || latest.id === lastProcessedIdRef.current) return;

    lastProcessedIdRef.current = latest.id;
    spawnReactionEffects(latest.emoji);
  }, [recentReactions]);

  const handleTriggerReaction = (emoji: string) => {
    // 1. Send via real-time callback to partner
    onSendReaction(emoji);

    // 2. Trigger local visual reaction immediately for sender
    spawnReactionEffects(emoji);
  };

  return (
    <>
      {/* Flying Emojis Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
        <AnimatePresence>
          {activeFlyingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: '80vh', scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: '20vh', scale: [0.8, 1.8, 1.4, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{ left: `${item.left}%` }}
              className="absolute text-5xl select-none drop-shadow-lg"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Reactions Bar */}
      <div
        className={`fixed bottom-4 sm:bottom-6 z-[60] transition-all duration-300 ease-in-out ${
          isRightPanelOpen ? 'right-4 md:right-[25rem]' : 'right-4 sm:right-6'
        }`}
      >
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#f5ebd9] dark:bg-[#28221c] border border-amber-800/40 shadow-2xl rounded-full text-xs font-semibold text-amber-900 dark:text-amber-300 hover:scale-105 transition-all backdrop-blur-md"
            title="Open Live Reaction Bar"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
            <span>Send Reaction</span>
          </button>
        ) : (
          <div className="bg-[#f5ebd9]/95 dark:bg-[#28221c]/95 border border-amber-800/30 dark:border-amber-600/40 shadow-2xl rounded-2xl p-1.5 sm:p-2 flex items-center gap-1 sm:gap-1.5 backdrop-blur-md font-sans max-w-[calc(100vw-2rem)] overflow-x-auto">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-[10px] uppercase font-bold tracking-wider text-amber-900 dark:text-amber-300 px-1.5 sm:px-2 flex items-center gap-1 border-r border-amber-800/20 dark:border-amber-600/30 hover:opacity-75 transition-opacity"
              title="Minimize reaction bar"
            >
              <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              <span className="hidden sm:inline">Send Ping</span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {EMOJI_OPTIONS.map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleTriggerReaction(item.emoji)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-amber-900/10 dark:hover:bg-amber-100/10 active:scale-95 transition-all text-sm sm:text-base shrink-0"
                  title={`Send ${item.label} ping`}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};