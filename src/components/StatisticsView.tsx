import React from 'react';
import {
  BarChart3,
  Feather,
  BookOpen,
  Flame,
  MessageSquare,
  Clock,
  Layers,
  Award,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const StatisticsView: React.FC = () => {
  const stats = StorageService.calculateUserStats();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#fbf8f3] dark:bg-[#181512] font-serif text-[#2c241c] dark:text-[#ebdcc8]">
      {/* Header */}
      <div className="border-b border-[#e8dfd1] dark:border-[#2d2720] pb-4">
        <h1 className="text-3xl font-bold font-['Playfair_Display',serif] flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-amber-800 dark:text-amber-400" />
          <span>Manuscript Statistics & History</span>
        </h1>
        <p className="text-xs font-serif italic text-[#786b58] dark:text-[#a09280] mt-1">
          "Quantifying the volume of quiet stanzas, letters, and years shared."
        </p>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Words */}
        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8c7e6b]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
              Total Words Written
            </span>
            <BookOpen className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-3xl font-bold font-['Playfair_Display',serif] text-amber-900 dark:text-amber-300">
            {stats.totalWords.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#786b58]">Across {stats.totalPoems} manuscripts</p>
        </div>

        {/* Writing Streak */}
        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8c7e6b]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
              Active Writing Streak
            </span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-bold font-['Playfair_Display',serif] text-orange-800 dark:text-orange-400">
            {stats.writingStreakDays} Days
          </div>
          <p className="text-[11px] text-[#786b58]">Consecutive stanzas added</p>
        </div>

        {/* Most Annotated Poem */}
        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8c7e6b]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
              Most Annotated Piece
            </span>
            <MessageSquare className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-lg font-bold font-['Playfair_Display',serif] text-[#1c1917] dark:text-[#f3e7d3] truncate">
            {stats.mostAnnotatedPoemTitle}
          </div>
          <p className="text-[11px] text-[#786b58]">
            {stats.mostAnnotatedCount} margin comments
          </p>
        </div>

        {/* Total Reading Time */}
        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#8c7e6b]">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
              Reading Time
            </span>
            <Clock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold font-['Playfair_Display',serif] text-emerald-800 dark:text-emerald-400">
            {stats.totalReadingMinutes} Minutes
          </div>
          <p className="text-[11px] text-[#786b58]">Estimated complete reading</p>
        </div>
      </div>

      {/* Daily Word Count History Chart */}
      <section className="p-6 bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-lg font-bold font-['Playfair_Display',serif]">
          Words Written This Week
        </h3>

        <div className="flex items-end gap-3 h-40 pt-6">
          {stats.dailyWordHistory.map((item) => {
            const heightPct = Math.min(100, (item.wordCount / 1000) * 100);
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-sans font-bold text-amber-900 dark:text-amber-300">
                  {item.wordCount}
                </span>
                <div
                  className="w-full bg-amber-900/80 dark:bg-amber-500/80 rounded-t-lg transition-all duration-500 hover:opacity-90"
                  style={{ height: `${Math.max(12, heightPct)}%` }}
                />
                <span className="text-xs font-sans text-[#8c7e6b]">{item.date}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl space-y-1">
          <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7e6b]">
            Longest Manuscript
          </div>
          <div className="font-bold text-lg font-['Playfair_Display',serif]">
            {stats.longestPoemTitle}
          </div>
          <p className="text-xs text-[#786b58]">{stats.longestPoemWordCount} words written</p>
        </div>

        <div className="p-5 bg-[#f7f2e8] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#332c24] rounded-2xl space-y-1">
          <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#8c7e6b]">
            Primary Collection Theme
          </div>
          <div className="font-bold text-lg font-['Playfair_Display',serif]">
            {stats.favoriteCollection}
          </div>
          <p className="text-xs text-[#786b58]">Most populated manuscript collection</p>
        </div>
      </div>
    </div>
  );
};
