import React, { useState, Dispatch, SetStateAction } from 'react';
import {
  Feather,
  Plus,
  Home,
  BookOpen,
  FolderHeart,
  Star,
  Archive,
  Trash2,
  BarChart3,
  Settings,
  Search,
  UserCheck,
  ChevronRight,
  Sparkles,
  Layers,
  Heart,
  Moon,
  Mail,
  Snowflake,
  Compass,
  Camera,
} from 'lucide-react';
import { AuthorProfile, Collection } from '../types';
import { ViewType } from '../App'; // <-- Import ViewType (adjust path if needed)
import { AmbientAudioWidget } from './AmbientAudioWidget';
import { AmbientSoundType } from '../types';

interface NavigationSidebarProps {
  currentView: ViewType | string;
  // Allows passing setCurrentView directly or passing a custom callback
  onChangeView: Dispatch<SetStateAction<ViewType>> | ((view: ViewType) => void) | ((view: string) => void);
  collections: Collection[];
  activeCollectionId?: string;
  onSelectCollection: (colId: string) => void;
  authors: AuthorProfile[];
  currentAuthorId: string;
  onSwitchAuthor: (authorId: string) => void;
  onNewDocument: () => void;
  onOpenSearch: () => void;
  ambientSound: AmbientSoundType;
  onChangeAmbientSound: (type: AmbientSoundType) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentView,
  onChangeView,
  collections,
  activeCollectionId,
  onSelectCollection,
  authors,
  currentAuthorId,
  onSwitchAuthor,
  onNewDocument,
  onOpenSearch,
  ambientSound,
  onChangeAmbientSound,
  isOpen,
  onToggleOpen,
}) => {
  const [showAuthorMenu, setShowAuthorMenu] = useState(false);

  const currentAuthor = authors.find((a) => a.id === currentAuthorId) || authors[0];
  const partnerAuthor = authors.find((a) => a.id !== currentAuthorId) || authors[1];

  // Helper handler so calling onChangeView stays clean
  const handleViewChange = (view: ViewType | string) => {
    (onChangeView as (view: any) => void)(view);
  };

  const getCollectionIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'feather':
        return <Feather className="w-4 h-4" />;
      case 'mail':
        return <Mail className="w-4 h-4" />;
      case 'moon':
        return <Moon className="w-4 h-4" />;
      case 'bookopen':
        return <BookOpen className="w-4 h-4" />;
      case 'heart':
        return <Heart className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'snowflake':
        return <Snowflake className="w-4 h-4" />;
      case 'compass':
        return <Compass className="w-4 h-4" />;
      case 'camera':
        return <Camera className="w-4 h-4" />;
      default:
        return <FolderHeart className="w-4 h-4" />;
    }
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#f6f2ea] dark:bg-[#1a1714] border-r border-[#e8dfd1] dark:border-[#2d2720] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top Header / Brand */}
      <div className="p-4 border-b border-[#e8dfd1] dark:border-[#2d2720]">
        <div className="flex items-center justify-between mb-3">
          <div
            onClick={() => handleViewChange('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2c241c] text-[#f7e7ce] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Feather className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg tracking-[0.1em] text-[#2c241c] dark:text-[#f3e7d3] font-['Cinzel',serif] leading-none">
                NATASHA’S SANCTUARY
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-[#786b58] dark:text-[#9e907e] font-sans mt-0.5 font-semibold">
                Poems & Notes by Neenv
              </p>
            </div>
          </div>
        </div>

        {/* Natasha's Sanctuary Profile Card */}
        <div className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-[#ece5d8] dark:bg-[#25201b] border border-[#dfd6c6] dark:border-[#383028]">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: currentAuthor.avatarColor }}
          >
            {currentAuthor.name.charAt(0)}
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-[#2c241c] dark:text-[#ebdcc8] truncate font-serif">
              {currentAuthor.name}
            </div>
            <div className="text-[10px] text-[#786b58] dark:text-[#a09280] truncate">
              {currentAuthor.title}
            </div>
          </div>
        </div>

        {/* Quick Search trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full mt-2.5 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ece5d8]/70 dark:bg-[#25201b]/70 border border-[#dfd6c6] dark:border-[#383028] text-xs text-[#786b58] dark:text-[#a09280] hover:text-[#2c241c] hover:border-amber-800/30 transition-all text-left"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 font-serif">Search manuscript, tags...</span>
          <kbd className="px-1.5 py-0.5 text-[9px] bg-[#dfd6c6] dark:bg-[#342d25] rounded text-[#524636] dark:text-[#b0a290]">
            ⌘K
          </kbd>
        </button>

        {/* New Document Action */}
        <button
          onClick={onNewDocument}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2c241c] dark:bg-[#e6d8c3] text-[#f7e7ce] dark:text-[#2c241c] font-serif text-xs font-semibold tracking-wide hover:bg-[#3d3227] dark:hover:bg-[#f2e5d2] transition-all shadow-sm group"
        >
          <Plus className="w-4 h-4 stroke-[2.2] group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Poem from Neenv</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 font-serif text-xs">
        {/* Main Section */}
        <div className="space-y-1">
          <button
            onClick={() => handleViewChange('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'home'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Home className="w-4 h-4 text-amber-900/80 dark:text-amber-400" />
            <span>Studio Home</span>
          </button>

          <button
            onClick={() => handleViewChange('collections')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'collections'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-900/80 dark:text-amber-400" />
            <span>Poem Suites & Collections</span>
          </button>

          <button
            onClick={() => handleViewChange('photos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'photos'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Camera className="w-4 h-4 text-rose-700 dark:text-rose-400" />
            <span>Memory Photos</span>
          </button>

          <button
            onClick={() => handleViewChange('favorites')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'favorites'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Natasha's Favorites</span>
          </button>
        </div>

        {/* Collections List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1 text-[10px] font-sans font-bold uppercase tracking-wider text-[#8c7e6b] dark:text-[#887865]">
            <span>Collections</span>
            <button
              onClick={() => handleViewChange('collections')}
              className="hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
            >
              All
            </button>
          </div>

          <div className="space-y-0.5">
            {collections.map((col) => {
              const isActive = currentView === 'collection_detail' && activeCollectionId === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => onSelectCollection(col.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                      : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span style={{ color: col.color }}>{getCollectionIcon(col.iconName)}</span>
                    <span className="truncate">{col.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Utilities */}
        <div className="pt-2 border-t border-[#e8dfd1] dark:border-[#2d2720] space-y-0.5">
          <button
            onClick={() => handleViewChange('statistics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'statistics'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Manuscript Stats</span>
          </button>

          <button
            onClick={() => handleViewChange('archive')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'archive'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Archive className="w-4 h-4 opacity-80" />
            <span>Archive</span>
          </button>

          <button
            onClick={() => handleViewChange('trash')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'trash'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Trash2 className="w-4 h-4 opacity-70" />
            <span>Trash</span>
          </button>

          <button
            onClick={() => handleViewChange('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentView === 'settings'
                ? 'bg-[#e8dfd1] dark:bg-[#2b251e] text-[#2c241c] dark:text-[#ebdcc8] font-semibold'
                : 'text-[#615343] dark:text-[#a89a87] hover:bg-[#eee6d8] dark:hover:bg-[#241f19]'
            }`}
          >
            <Settings className="w-4 h-4 opacity-80" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Footer Ambient Audio Widget */}
      <div className="p-3 border-t border-[#e8dfd1] dark:border-[#2d2720]">
        <AmbientAudioWidget
          currentSound={ambientSound}
          onChangeSound={onChangeAmbientSound}
        />
      </div>
    </aside>
  );
};