import React, { useState } from 'react';
import {
  Settings,
  X,
  Palette,
  Users,
  Type,
  Download,
  Upload,
  Shield,
  FileText,
  Check,
  Lock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { AuthorProfile, ThemeMode, PalimpsestDocument } from '../types';
import { StorageService } from '../services/storageService';
import { FONT_LIBRARY } from '../data/fonts';
import { INITIAL_DOCUMENTS } from '../data/initialData';

interface SettingsModalProps {
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  authors: AuthorProfile[];
  onUpdateAuthors: (authors: AuthorProfile[]) => void;
  activeDocument?: PalimpsestDocument;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  onChangeTheme,
  authors,
  onUpdateAuthors,
  activeDocument,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'authors' | 'fonts' | 'backup'>('theme');
  const [editedAuthors, setEditedAuthors] = useState<AuthorProfile[]>(authors);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const themeOptions: { mode: ThemeMode; label: string; desc: string; color: string }[] = [
    { mode: 'sepia', label: 'Warm Sepia', desc: 'Classic aged manuscript parchment', color: '#fbf8f3' },
    { mode: 'library', label: 'Old Library', desc: 'Warm leather and cathedral wood', color: '#2c241c' },
    { mode: 'light', label: 'Ivory Light', desc: 'Clean bright paper with high contrast', color: '#ffffff' },
    { mode: 'dark', label: 'Midnight Dark', desc: 'Deep warm charcoal canvas', color: '#1a1714' },
    { mode: 'night', label: 'Starlight Night', desc: 'Soft dark blue midnight tone', color: '#0f172a' },
    { mode: 'rain', label: 'Atmospheric Rain', desc: 'Cool misty grey with soft contrast', color: '#1f2937' },
    { mode: 'christmas', label: 'Winter Hearth', desc: 'Deep forest green and warm burgundy', color: '#064e3b' },
  ];

  const handleSaveAuthors = () => {
    onUpdateAuthors(editedAuthors);
    StorageService.saveAuthors(editedAuthors);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importBackupJSON(content);
        if (success) {
          setImportStatus('Backup restored successfully! Please refresh.');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setImportStatus('Failed to restore backup. Check JSON file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#fbf8f3] dark:bg-[#1f1b17] border border-[#ebd2b4] dark:border-[#383028] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-serif flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e8dfd1] dark:border-[#2d2720] bg-[#f7f2e8] dark:bg-[#25201b]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-800 dark:text-amber-400" />
            <h2 className="font-bold text-lg font-['Playfair_Display',serif]">
              Palimpsest Studio Settings
            </h2>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-[#eae0d0] rounded">
            <X className="w-4 h-4 text-[#786b58]" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-2 bg-[#f2ebd9] dark:bg-[#231e19] border-b border-[#e8dfd1] dark:border-[#2d2720] text-xs">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'theme' ? 'bg-[#fbf8f3] dark:bg-[#1f1b17] font-bold shadow-2xs' : 'opacity-70'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Atmosphere</span>
          </button>

          <button
            onClick={() => setActiveTab('authors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'authors' ? 'bg-[#fbf8f3] dark:bg-[#1f1b17] font-bold shadow-2xs' : 'opacity-70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Natasha’s Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'fonts' ? 'bg-[#fbf8f3] dark:bg-[#1f1b17] font-bold shadow-2xs' : 'opacity-70'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Font Library</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'backup' ? 'bg-[#fbf8f3] dark:bg-[#1f1b17] font-bold shadow-2xs' : 'opacity-70'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Import & Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-serif">
          {/* TAB 1: THEMES */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm mb-1 font-['Playfair_Display',serif]">
                  Select Studio Atmosphere
                </h3>
                <p className="text-[#786b58] text-[11px] italic">
                  Choose a reading and writing theme that suits your mood and lighting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => onChangeTheme(opt.mode)}
                    className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                      theme === opt.mode
                        ? 'border-amber-700 bg-amber-900/10 dark:bg-amber-500/20 font-bold shadow-sm'
                        : 'border-[#e8dfd1] dark:border-[#332c24] hover:border-amber-800/40 bg-[#fefcf8] dark:bg-[#1a1714]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-[10px] text-[#786b58] font-sans mt-0.5">{opt.desc}</div>
                    </div>
                    {theme === opt.mode && <Check className="w-4 h-4 text-amber-800" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AUTHORS */}
          {activeTab === 'authors' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm mb-1 font-['Playfair_Display',serif]">
                  Natasha Raman’s Sanctuary Profile
                </h3>
                <p className="text-[#786b58] text-[11px] italic">
                  Customize Natasha’s custodian profile, title, and bio for this private sanctuary.
                </p>
              </div>

              <div className="space-y-4">
                {editedAuthors.map((author, index) => (
                  <div
                    key={author.id}
                    className="p-4 bg-[#f8f4ed] dark:bg-[#181512] border border-[#e5dad0] dark:border-[#332c24] rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: author.avatarColor }}
                      >
                        {author.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm">{author.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-sans text-[#8c7e6b]">Name</label>
                        <input
                          type="text"
                          value={author.name}
                          onChange={(e) => {
                            const updated = [...editedAuthors];
                            updated[index].name = e.target.value;
                            setEditedAuthors(updated);
                          }}
                          className="w-full p-1.5 bg-[#efe6d8] dark:bg-[#25201b] border border-[#dfd5c5] rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-sans text-[#8c7e6b]">Title / Role</label>
                        <input
                          type="text"
                          value={author.title}
                          onChange={(e) => {
                            const updated = [...editedAuthors];
                            updated[index].title = e.target.value;
                            setEditedAuthors(updated);
                          }}
                          className="w-full p-1.5 bg-[#efe6d8] dark:bg-[#25201b] border border-[#dfd5c5] rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSaveAuthors}
                  className="px-4 py-2 bg-[#2c241c] text-[#f7e7ce] rounded-xl font-semibold hover:opacity-90"
                >
                  Save Profiles
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FONTS */}
          {activeTab === 'fonts' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm mb-1 font-['Playfair_Display',serif]">
                  Literary Font Library
                </h3>
                <p className="text-[#786b58] text-[11px] italic">
                  Typography styles available for reading and writing stanzas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FONT_LIBRARY.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-[#f8f4ed] dark:bg-[#181512] border border-[#e5dad0] dark:border-[#332c24] rounded-xl space-y-1"
                  >
                    <div style={{ fontFamily: f.family }} className="font-bold text-lg text-[#1c1917] dark:text-[#ebdcc8]">
                      {f.name}
                    </div>
                    <div className="text-[10px] text-[#786b58] font-sans">{f.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm mb-1 font-['Playfair_Display',serif]">
                  Manuscript Export & Backup
                </h3>
                <p className="text-[#786b58] text-[11px] italic">
                  Ensure permanent preservation by exporting full backups or individual pieces.
                </p>
              </div>

              {/* Active Document Single Export */}
              {activeDocument && (
                <div className="p-4 bg-[#f8f4ed] dark:bg-[#181512] border border-[#e5dad0] dark:border-[#332c24] rounded-xl space-y-2">
                  <div className="font-bold text-sm">Export Current Document ("{activeDocument.title}")</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => StorageService.exportAsPlainText(activeDocument)}
                      className="px-3 py-1.5 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] rounded text-xs font-semibold hover:bg-[#e4d9c7]"
                    >
                      Plain Text (.txt)
                    </button>
                    <button
                      onClick={() => StorageService.exportAsMarkdown(activeDocument)}
                      className="px-3 py-1.5 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] rounded text-xs font-semibold hover:bg-[#e4d9c7]"
                    >
                      Markdown (.md)
                    </button>
                    <button
                      onClick={() => StorageService.exportAsHTML(activeDocument)}
                      className="px-3 py-1.5 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] rounded text-xs font-semibold hover:bg-[#e4d9c7]"
                    >
                      Web HTML (.html)
                    </button>
                  </div>
                </div>
              )}

              {/* Full JSON Backup */}
              <div className="p-4 bg-[#f8f4ed] dark:bg-[#181512] border border-[#e5dad0] dark:border-[#332c24] rounded-xl space-y-3">
                <div className="font-bold text-sm">Full Studio Backup & Restore</div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => StorageService.exportBackupJSON()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#2c241c] text-[#f7e7ce] rounded-xl font-semibold hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-4 py-2 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] rounded-xl font-semibold cursor-pointer hover:bg-[#e4d9c7]">
                    <Upload className="w-4 h-4" />
                    <span>Restore from JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <div className="text-xs font-semibold text-emerald-700">{importStatus}</div>
                )}
              </div>

              {/* Sample Data Management */}
              <div className="p-4 bg-[#fcf8f2] dark:bg-[#1f1a16] border border-amber-800/20 dark:border-amber-500/20 rounded-xl space-y-3">
                <div className="font-bold text-sm text-[#2c241c] dark:text-[#ebdcc8]">
                  Clear Sample Data & Start Fresh
                </div>
                <p className="text-[#786b58] dark:text-[#a09280] text-[11px] leading-relaxed">
                  You can clear all sample poems to start with an empty sanctuary for Natasha, or restore default sample poems anytime.
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => {
                      if (confirm('Clear all sample poems from Natasha’s sanctuary? You will start with a fresh blank canvas.')) {
                        StorageService.clearAllDocuments();
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-800 text-white rounded-xl text-xs font-semibold hover:bg-rose-900 transition-colors shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Sample Poems</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Restore default sample poems to the sanctuary?')) {
                        StorageService.saveDocuments(INITIAL_DOCUMENTS);
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] dark:border-[#382f25] text-[#2c241c] dark:text-[#ebdcc8] rounded-xl text-xs font-semibold hover:bg-[#e4d9c7]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Sample Poems</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
