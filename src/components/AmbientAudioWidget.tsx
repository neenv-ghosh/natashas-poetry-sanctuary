import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, BookOpen, Moon, Coffee, Music, Play, Pause, Disc, Waves, Flame, Trees } from 'lucide-react';
import { ambientAudioService } from '../services/ambientAudioService';
import { AmbientSoundType } from '../types';

interface AmbientAudioWidgetProps {
  currentSound: AmbientSoundType;
  onChangeSound: (type: AmbientSoundType) => void;
  compact?: boolean;
}

export const AmbientAudioWidget: React.FC<AmbientAudioWidgetProps> = ({
  currentSound,
  onChangeSound,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(currentSound !== 'none');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);

  useEffect(() => {
    setIsPlaying(currentSound !== 'none');
  }, [currentSound]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientAudioService.stopCurrent();
      onChangeSound('none');
      setIsPlaying(false);
    } else {
      const nextSound = currentSound === 'none' ? 'rain' : currentSound;
      ambientAudioService.playSound(nextSound);
      onChangeSound(nextSound);
      setIsPlaying(true);
    }
  };

  const handleSelectSound = (type: AmbientSoundType) => {
    ambientAudioService.playSound(type);
    onChangeSound(type);
    setIsPlaying(type !== 'none');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientAudioService.setVolume(val);
  };

  const handleToggleMute = () => {
    const muted = ambientAudioService.toggleMute();
    setIsMuted(muted);
  };

  const soundOptions: { type: AmbientSoundType; label: string; icon: React.ReactNode }[] = [
    { type: 'rain', label: 'Rain on Sill', icon: <CloudRain className="w-4 h-4" /> },
    { type: 'library', label: 'Old Library', icon: <BookOpen className="w-4 h-4" /> },
    { type: 'night', label: 'Night Breeze', icon: <Moon className="w-4 h-4" /> },
    { type: 'cafe', label: 'Writing Cafe', icon: <Coffee className="w-4 h-4" /> },
    { type: 'piano', label: 'Chamber Piano', icon: <Music className="w-4 h-4" /> },
    { type: 'waves', label: 'Ocean Tide', icon: <Waves className="w-4 h-4" /> },
    { type: 'fireplace', label: 'Hearth Fire', icon: <Flame className="w-4 h-4" /> },
    { type: 'forest', label: 'Forest Leaves', icon: <Trees className="w-4 h-4" /> },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-[#f5f1e8]/90 dark:bg-[#28231d]/90 border border-[#e5ded0] dark:border-[#3d352b] rounded-full px-2.5 py-1 text-xs text-[#524636] dark:text-[#d6c7b2] shadow-xs">
        <button
          onClick={handleTogglePlay}
          className="p-1 rounded-full hover:bg-[#eae3d2] dark:hover:bg-[#383027] text-amber-800 dark:text-amber-400 transition-colors"
          title={isPlaying ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <span className="font-serif italic capitalize text-[13px] px-1 truncate max-w-[100px]">
          {currentSound === 'none' ? 'Ambient Audio' : currentSound}
        </span>

        <button
          onClick={handleToggleMute}
          className="p-1 rounded-full hover:bg-[#eae3d2] dark:hover:bg-[#383027] transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 opacity-60" /> : <Volume2 className="w-3.5 h-3.5 opacity-80" />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfaf7] dark:bg-[#211d18] border border-[#e8e2d5] dark:border-[#362f27] rounded-xl p-3 shadow-sm text-[#383027] dark:text-[#e0d6c5]">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#ebd2b4]/40 dark:border-[#3a3229]">
        <div className="flex items-center gap-2">
          <Disc className={`w-4 h-4 text-amber-700 dark:text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          <span className="font-serif text-sm font-semibold tracking-wide font-['Playfair_Display',serif]">
            Atmospheric Sounds
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-1 rounded-md hover:bg-[#f0e9dc] dark:hover:bg-[#2d2720] text-[#786b59] dark:text-[#a89a87]"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-[#e0d6c5] dark:bg-[#3d342a] rounded-lg appearance-none cursor-pointer accent-amber-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {soundOptions.map((opt) => {
          const isActive = currentSound === opt.type && isPlaying;
          return (
            <button
              key={opt.type}
              onClick={() => handleSelectSound(isActive ? 'none' : opt.type)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-serif transition-all text-left ${
                isActive
                  ? 'bg-amber-900/10 dark:bg-amber-500/15 border border-amber-700/40 text-amber-900 dark:text-amber-200 font-semibold shadow-2xs'
                  : 'hover:bg-[#f3ede0] dark:hover:bg-[#2b251e] border border-transparent text-[#615343] dark:text-[#b8aa97]'
              }`}
            >
              <span className={isActive ? 'text-amber-800 dark:text-amber-400' : 'opacity-70'}>{opt.icon}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
