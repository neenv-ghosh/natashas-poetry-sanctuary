import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPresenceState, AuthorProfile } from '../types';
import { Radio, Compass, Users, Sparkles, Edit3, Eye, ArrowRight, UserCheck } from 'lucide-react';

interface PresenceHeaderBarProps {
  currentAuthor: AuthorProfile;
  allAuthors: AuthorProfile[];
  onSelectAuthor: (authorId: string) => void;
  partnerPresence: UserPresenceState | null;
  onTeleportToPoem: (poemId: string, viewMode?: 'read' | 'edit') => void;
  isSupabaseActive: boolean;
}

export const PresenceHeaderBar: React.FC<PresenceHeaderBarProps> = ({
  currentAuthor,
  allAuthors,
  onSelectAuthor,
  partnerPresence,
  onTeleportToPoem,
  isSupabaseActive,
}) => {
  const [showAuthorMenu, setShowAuthorMenu] = useState(false);

  // Partner info
  const partnerAuthor = allAuthors.find((a) => a.id !== currentAuthor.id) || allAuthors[0];
  const partnerUser = partnerPresence?.user || partnerAuthor;
  const isPartnerOnline = Boolean(partnerPresence);

  return (
    <div className="bg-[#f5ebd9] dark:bg-[#201b16] border-b border-[#e5d8c3] dark:border-[#332a22] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-[#2c241c] dark:text-[#ebdcc8]">
      {/* Left: Partner Realtime Presence & Teleportation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ebdcc8]/60 dark:bg-[#2c241c]/60 border border-amber-900/10 dark:border-amber-100/10">
          <span className="relative flex h-2 w-2">
            {isPartnerOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600/40"></span>
            )}
          </span>

          <span className="font-medium text-[#1c1917] dark:text-[#ebdcc8] flex items-center gap-1.5">
            <span style={{ color: partnerUser.avatarColor }} className="font-semibold">
              {partnerUser.name}
            </span>
            {isPartnerOnline ? (
              partnerPresence?.isTyping ? (
                <span className="text-amber-800 dark:text-amber-400 italic flex items-center gap-1">
                  <Edit3 className="w-3 h-3 animate-bounce" />
                  is typing {partnerPresence.typingTarget || 'stanzas'}...
                </span>
              ) : partnerPresence?.activePoemTitle ? (
                <span className="text-[#635545] dark:text-[#a0917e]">
                  is viewing <strong className="text-[#2c241c] dark:text-[#ebdcc8]">"{partnerPresence.activePoemTitle}"</strong>
                </span>
              ) : (
                <span className="text-[#635545] dark:text-[#a0917e]">is in Sanctuary Home</span>
              )
            ) : (
              <span className="text-[#8c7e6b] dark:text-[#786b58] italic">(Sanctuary Ready)</span>
            )}
          </span>
        </div>

        {/* Teleport Button */}
        {isPartnerOnline && partnerPresence?.activePoemId && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTeleportToPoem(partnerPresence.activePoemId!, 'read')}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-700 to-rose-700 hover:from-amber-800 hover:to-rose-800 text-white font-medium text-[11px] shadow-sm flex items-center gap-1.5 transition-all"
            title={`Teleport to open "${partnerPresence.activePoemTitle || 'current stanza'}"`}
          >
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Teleport</span>
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
      </div>

      {/* Right: Active Identity Profile Switcher & Supabase Live Status */}
      <div className="flex items-center gap-3">
        {/* Supabase Status Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono"
          title={isSupabaseActive ? 'Connected to Supabase Cloud Database & Realtime' : 'Local Storage Mode'}
        >
          <Radio className={`w-3 h-3 ${isSupabaseActive ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-amber-600'}`} />
          <span className="text-[#786b58] dark:text-[#a0917e]">
            {isSupabaseActive ? 'Supabase Sync Active' : 'Local Offline Mode'}
          </span>
        </div>

        {/* Active Profile Dropdown Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowAuthorMenu(!showAuthorMenu)}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ebdcc8] dark:bg-[#2e261f] hover:bg-[#e2d0b8] dark:hover:bg-[#382f27] border border-amber-900/15 dark:border-amber-100/15 transition-colors"
          >
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentAuthor.avatarColor }}
            />
            <span className="font-semibold text-[#1c1917] dark:text-[#ebdcc8] text-xs">
              {currentAuthor.name}
            </span>
            <span className="text-[10px] text-amber-800 dark:text-amber-400 font-serif italic">
              ({currentAuthor.id === 'author-neenv' ? 'Poet' : 'Muse'})
            </span>
          </button>

          <AnimatePresence>
            {showAuthorMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-[#f8f1e5] dark:bg-[#26201a] border border-amber-800/20 dark:border-amber-600/30 shadow-xl py-2 z-50 font-sans"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c7e6b] dark:text-[#9e8f7c] border-b border-amber-900/10 dark:border-amber-100/10 mb-1">
                  Switch Active Identity
                </div>
                {allAuthors.map((author) => {
                  const isSelected = author.id === currentAuthor.id;
                  return (
                    <button
                      key={author.id}
                      onClick={() => {
                        onSelectAuthor(author.id);
                        setShowAuthorMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-amber-900/10 dark:hover:bg-amber-100/10 transition-colors ${
                        isSelected ? 'bg-amber-900/15 dark:bg-amber-100/15 font-bold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: author.avatarColor }}
                        />
                        <div>
                          <div className="text-xs font-medium text-[#1c1917] dark:text-[#ebdcc8]">
                            {author.name}
                          </div>
                          <div className="text-[10px] text-[#786b58] dark:text-[#a09280] font-serif italic">
                            {author.title}
                          </div>
                        </div>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
