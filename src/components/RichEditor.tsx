import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { FontFamily } from './tiptapFontFamilyExtension';
import { FormattingToolbar } from './FormattingToolbar';
import { PalimpsestDocument, AuthorProfile } from '../types';
import { uploadPoemImageToSupabaseBucket } from '../services/supabase';
import {
  MessageSquare,
  Sparkles,
  Heart,
  Search,
  X,
  Upload,
  Maximize2,
  BookOpen,
  Trash2,
  Lock,
  Hourglass,
} from 'lucide-react';

interface RichEditorProps {
  document: PalimpsestDocument;
  currentAuthor: AuthorProfile;
  coAuthor: AuthorProfile;
  onUpdateDocument: (updated: PalimpsestDocument) => void;
  onDeleteDocument?: (docId: string) => void;
  onEnterReadingMode: () => void;
  onEnterFocusMode: () => void;
  onOpenMarginPanel: () => void;
}

const AutoResizingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={`${className || ''} overflow-hidden resize-none`}
    />
  );
};

export const RichEditor: React.FC<RichEditorProps> = ({
  document,
  currentAuthor,
  coAuthor,
  onUpdateDocument,
  onDeleteDocument,
  onEnterReadingMode,
  onEnterFocusMode,
  onOpenMarginPanel,
}) => {
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTimeCapsuleModal, setShowTimeCapsuleModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Time Capsule Form state
  const [unlockDateInput, setUnlockDateInput] = useState(
    document.timeCapsuleUnlockDate || ''
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadPoemImageToSupabaseBucket(file);
      if (publicUrl) {
        setImageUrlInput(publicUrl);
      } else {
        // Fallback to data URL if Supabase storage isn't configured
        const reader = new FileReader();
        reader.onload = (event) => {
          setImageUrlInput(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Floating Annotation Selection state
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ x: number; y: number } | null>(null);
  const [annotationNote, setAnnotationNote] = useState('');
  const [showAnnotationPopover, setShowAnnotationPopover] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder:
          'Paste or write Neenv’s poem or stanza here... (Supports multi-line stanzas, italics, and quotes)',
      }),
    ],
    content: document.content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none focus:outline-none min-h-[550px] leading-snug font-serif text-lg text-[#2c2621] dark:text-[#e0d6c5]',
        style: `font-family: ${document.fontStyle || "'Cormorant Garamond', serif"}; font-size: ${
          document.fontSize || 18
        }px;`,
      },
    },
    onUpdate: ({ editor }) => {
      setSaveState('saving');
      const html = editor.getHTML();

      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const words = plainText.trim().split(/\s+/).filter(Boolean).length;
      const chars = plainText.length;
      const readingMin = Math.max(1, Math.ceil(words / 200));

      onUpdateDocument({
        ...document,
        content: html,
        wordCount: words,
        characterCount: chars,
        readingTimeMinutes: readingMin,
      });

      setTimeout(() => {
        setSaveState('saved');
      }, 800);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text && text.trim().length > 2) {
        setSelectedText(text.trim());
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionRange({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
        }
      } else {
        if (!showAnnotationPopover) {
          setSelectedText('');
          setSelectionRange(null);
        }
      }
    },
  });

  // Keep editor content synced if document changes externally
  useEffect(() => {
    if (editor && document.content !== editor.getHTML()) {

      if (!editor.isFocused) {
        editor.commands.setContent(document.content);
      }
    }
  }, [document.content, editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDocument({
      ...document,
      title: e.target.value,
    });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateDocument({
      ...document,
      subtitle: e.target.value,
    });
  };

  const handleAddSelectionAnnotation = () => {
    if (!selectedText || !annotationNote.trim()) return;

    const newAnn = {
      id: 'ann-' + Date.now(),
      docId: document.id,
      selectedText,
      comment: annotationNote.trim(),
      authorId: currentAuthor.id,
      createdAt: new Date().toISOString(),
      color: '#fef08a',
      resolved: false,
      replies: [],
    };

    onUpdateDocument({
      ...document,
      annotations: [newAnn, ...document.annotations],
    });

    setAnnotationNote('');
    setShowAnnotationPopover(false);
    setSelectedText('');
    setSelectionRange(null);
    onOpenMarginPanel();
  };

  const handleInsertImage = () => {
    if (!imageUrlInput.trim()) return;

    // Insert into TipTap content if editor exists
    if (editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrlInput.trim(), alt: imageCaptionInput })
        .run();
    }

    // Also attach to Document Photos Gallery array
    const newPhoto = {
      id: 'photo-' + Date.now(),
      url: imageUrlInput.trim(),
      caption: imageCaptionInput.trim(),
      uploadedAt: new Date().toISOString(),
    };

    onUpdateDocument({
      ...document,
      photos: [...(document.photos || []), newPhoto],
    });

    setShowImageModal(false);
    setImageUrlInput('');
    setImageCaptionInput('');
  };

  const handleInsertSymbol = (sym: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(sym).run();
  };

  const handleInsertDate = () => {
    if (!editor) return;
    const formatted = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    editor.chain().focus().insertContent(`<em>${formatted}</em> `).run();
  };

  const handleAddParagraphReaction = (emoji: string) => {
    const newRx = {
      id: 'rx-' + Date.now(),
      paragraphIndex: 0,
      emoji,
      authorId: currentAuthor.id,
      createdAt: new Date().toISOString(),
    };
    onUpdateDocument({
      ...document,
      reactions: [...(document.reactions || []), newRx],
    });
  };

  const handleSaveTimeCapsule = () => {
    onUpdateDocument({
      ...document,
      isTimeCapsule: !!unlockDateInput,
      timeCapsuleUnlockDate: unlockDateInput || undefined,
    });
    setShowTimeCapsuleModal(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#fdfbf7] dark:bg-[#181512] relative overflow-hidden">
      {/* Top Header Controls bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f6f2ea] dark:bg-[#1f1b17] border-b border-[#e8dfd1] dark:border-[#2d2720] text-xs font-serif">
        <div className="flex items-center gap-3 text-[#786b58] dark:text-[#a09280]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-sans text-[11px] font-medium">
              {saveState === 'saving'
                ? 'Saving manuscript layer...'
                : 'All layers saved'}
            </span>
          </span>

          <span className="text-amber-900/30 font-sans">|</span>

          <span>{document.wordCount} words</span>
          <span>&bull;</span>
          <span>~{document.readingTimeMinutes} min read</span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Reaction shortcut bar */}
          <div className="hidden sm:flex items-center gap-1 bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] dark:border-[#383028] rounded-full px-2 py-0.5">
            {['❤️', '⭐', '🌙', '🦋', '📖'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddParagraphReaction(emoji)}
                className="hover:scale-125 transition-transform text-sm px-0.5"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTimeCapsuleModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-sans font-medium transition-colors ${
              document.isTimeCapsule
                ? 'bg-amber-900/15 border-amber-700/40 text-amber-900 dark:text-amber-300'
                : 'bg-[#efe6d8] dark:bg-[#28221c] border-[#dfd5c5] dark:border-[#383028] text-[#3d3328] dark:text-[#d6c7b2]'
            }`}
            title="Time Capsule Options"
          >
            <Hourglass
              className={`w-3.5 h-3.5 ${
                document.isTimeCapsule
                  ? 'text-amber-700 dark:text-amber-400 animate-pulse'
                  : ''
              }`}
            />
            <span>
              {document.isTimeCapsule ? 'Capsule Active' : 'Time Capsule'}
            </span>
          </button>

          <button
            onClick={onEnterFocusMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] dark:border-[#383028] text-[#3d3328] dark:text-[#d6c7b2] hover:bg-[#e6dcce] transition-colors"
            title="Focus Mode (Distraction Free)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-sans font-medium text-[11px]">
              Focus Mode
            </span>
          </button>

          <button
            onClick={onEnterReadingMode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] font-sans font-medium text-[11px] hover:bg-[#3d3227] transition-colors"
            title="Reading Mode (Parchment & Page Turn)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Mode</span>
          </button>

          <button
            onClick={onOpenMarginPanel}
            className="p-1.5 rounded-lg bg-[#efe6d8] dark:bg-[#28221c] border border-[#dfd5c5] dark:border-[#383028] text-amber-900 dark:text-amber-400 relative"
            title="Open Margin Annotations"
          >
            <MessageSquare className="w-4 h-4" />
            {document.annotations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-800 text-amber-100 text-[9px] font-bold flex items-center justify-center font-sans">
                {document.annotations.length}
              </span>
            )}
          </button>

          {onDeleteDocument && (
            <button
              onClick={() => {
                if (window.confirm(`Move "${document.title}" to trash?`)) {
                  onDeleteDocument(document.id);
                }
              }}
              className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
              title="Move Poem to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Formatting Toolbar */}
      <FormattingToolbar
        editor={editor}
        onOpenImageModal={() => setShowImageModal(true)}
        onOpenFindReplace={() => setShowFindReplace(!showFindReplace)}
        onInsertDate={handleInsertDate}
        onInsertSymbol={handleInsertSymbol}
      />

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="flex items-center gap-2 p-2 bg-[#f0e8db] dark:bg-[#241f1a] border-b border-[#dfd5c5] dark:border-[#332b23] text-xs font-serif animate-in slide-in-from-top-1">
          <Search className="w-4 h-4 text-amber-800" />
          <input
            type="text"
            placeholder="Find text..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="px-2 py-1 bg-[#fbf8f3] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="px-2 py-1 bg-[#fbf8f3] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs"
          />
          <button
            onClick={() => {
              if (editor && findText) {
                const content = editor.getHTML();
                const newContent = content.replaceAll(findText, replaceText);
                editor.commands.setContent(newContent);
              }
            }}
            className="px-2.5 py-1 bg-[#2c241c] text-[#f7e7ce] rounded text-xs font-sans font-medium"
          >
            Replace All
          </button>
          <button
            onClick={() => setShowFindReplace(false)}
            className="p-1 hover:bg-[#e2d6c5] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Manuscript Writing Paper Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-12 flex justify-center selection:bg-amber-200 selection:text-amber-950">
        <div className="w-full max-w-3xl bg-[#fefcf8] dark:bg-[#1d1a16] border border-[#f0e7d8] dark:border-[#2d2720] shadow-xl rounded-2xl p-6 md:p-16 relative">
          {/* Subtle Manuscript Header Badge */}
          <div className="flex flex-wrap items-center justify-between text-xs text-[#8c7e6b] dark:text-[#a09280] border-b border-[#f0e5d5] dark:border-[#2b251e] pb-4 mb-6 font-serif italic gap-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentAuthor.avatarColor }}
              />
              <span>
                Written by{' '}
                <strong className="not-italic text-[#2c241c] dark:text-[#ebdcc8]">
                  Neenv
                </strong>{' '}
                for{' '}
                <strong className="not-italic text-amber-900 dark:text-amber-300">
                  {document.dedicatedTo || 'Natasha'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3 font-sans text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-amber-900/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 font-semibold uppercase tracking-wider text-[9px]">
                {document.category}
              </span>
              <span>&bull;</span>
              <span className="italic">{document.mood}</span>
            </div>
          </div>

          {/* Dedicated Date Written & Dedication Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 md:p-5 bg-[#f7f2e8] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#383028] rounded-2xl text-xs font-serif shadow-2xs">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] dark:text-[#9e907e] font-bold mb-1">
                Date Written & Occasion:
              </label>
              <input
                type="text"
                value={document.writtenDateFormatted || ''}
                onChange={(e) =>
                  onUpdateDocument({
                    ...document,
                    writtenDateFormatted: e.target.value,
                  })
                }
                placeholder="e.g. October 14, 2025 • First Snow in Chicago"
                className="w-full bg-transparent font-serif italic text-sm text-[#2c241c] dark:text-[#ebdcc8] border-b border-dashed border-[#dfd5c5] focus:border-amber-700 focus:outline-none pb-1"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] dark:text-[#9e907e] font-bold mb-1">
                Dedicated To:
              </label>
              <input
                type="text"
                value={document.dedicatedTo || 'Natasha Raman'}
                onChange={(e) =>
                  onUpdateDocument({ ...document, dedicatedTo: e.target.value })
                }
                placeholder="Natasha Raman"
                className="w-full bg-transparent font-serif italic text-sm text-[#2c241c] dark:text-[#ebdcc8] border-b border-dashed border-[#dfd5c5] focus:border-amber-700 focus:outline-none font-semibold pb-1"
              />
            </div>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={document.title}
            onChange={handleTitleChange}
            placeholder="Untitled Stanza for Natasha"
            className="w-full font-serif font-bold text-3xl md:text-4xl text-[#1c1917] dark:text-[#f3e7d3] bg-transparent border-b border-transparent hover:border-[#ebdcc8] focus:border-amber-700/60 focus:outline-none transition-colors mb-2 font-['Playfair_Display',serif] tracking-tight"
          />

          {/* Subtitle Input */}
          <input
            type="text"
            value={document.subtitle || ''}
            onChange={handleSubtitleChange}
            placeholder="Add an optional subtitle, location, or anthology part (e.g. Part 1 of 4 in October Suite)..."
            className="w-full font-serif italic text-base md:text-lg text-[#786b58] dark:text-[#a89a87] bg-transparent border-b border-transparent hover:border-[#ebdcc8] focus:border-amber-700/60 focus:outline-none transition-colors mb-6 font-['Cormorant_Garamond',serif]"
          />

          {/* Neenv's Poet Note / Personal Backstory Box */}
          <div className="mb-8 p-5 bg-[#f8f3e8] dark:bg-[#231e19] border-l-4 border-amber-800 dark:border-amber-500 rounded-r-2xl shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-900 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                <span className="text-sm font-['Playfair_Display',serif]">
                  Poet’s Note & Backstory from Neenv:
                </span>
              </span>
              <span className="text-[10px] font-sans font-normal opacity-70 italic">
                Personal backstory & memory
              </span>
            </div>
            <AutoResizingTextarea
              value={document.poetNote || ''}
              onChange={(val) =>
                onUpdateDocument({ ...document, poetNote: val })
              }
              placeholder="Neenv's note or backstory for this poem (e.g. 'Penned on a quiet autumn evening thinking of your laugh...')"
              className="w-full bg-transparent font-serif italic text-sm text-[#42382c] dark:text-[#d6c7b2] placeholder-[#8c7e6b]/60 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Tiptap Editor Content */}
          <EditorContent editor={editor} />

          {/* Natasha's Personal Reader Reflection */}
          <div className="mt-10 p-5 bg-[#f4ebe0] dark:bg-[#201c18] border border-[#e5d8c8] dark:border-[#383028] rounded-2xl shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-rose-950 dark:text-rose-300">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-700 fill-rose-700/30" />
                <span className="text-sm font-['Playfair_Display',serif]">
                  Natasha’s Personal Reflection:
                </span>
              </span>
              <span className="text-[10px] font-sans font-normal opacity-70 italic">
                Your thoughts & feelings
              </span>
            </div>
            <AutoResizingTextarea
              value={document.natashaReflection || ''}
              onChange={(val) =>
                onUpdateDocument({ ...document, natashaReflection: val })
              }
              placeholder="Natasha's personal thoughts when reading this poem... (e.g. 'My absolute favorite stanza! Remembering the afternoon by the river.')"
              className="w-full bg-transparent font-serif italic text-sm text-[#2c241c] dark:text-[#ebdcc8] placeholder-[#8c7e6b]/60 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Attached Photo Memories Gallery Section */}
          <div className="mt-8 pt-6 border-t border-[#f0e5d5] dark:border-[#2b251e] space-y-3">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-[#2c241c] dark:text-[#ebdcc8]">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-amber-800" />
                <span>
                  Photo Memories Attached to This Poem (
                  {document.photos?.length || 0})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="px-2.5 py-1 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-[11px] font-sans font-medium hover:opacity-90"
              >
                + Add Photo
              </button>
            </div>

            {document.photos && document.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {document.photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative group bg-[#f7f2e8] dark:bg-[#201c18] border border-[#e5dad0] dark:border-[#383028] p-2 rounded-lg text-xs space-y-1"
                  >
                    <div className="h-24 rounded overflow-hidden bg-black/10">
                      <img
                        src={p.url}
                        alt={p.caption || 'Memory'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {p.caption && (
                      <p className="italic text-[11px] text-[#42382c] dark:text-[#c7baa8] truncate">
                        {p.caption}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = (document.photos || []).filter(
                          (ph) => ph.id !== p.id
                        );
                        onUpdateDocument({ ...document, photos: filtered });
                      }}
                      className="absolute top-3 right-3 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-[#8c7e6b] font-serif">
                No photos attached yet. Click "+ Add Photo" to attach a memory
                photo for Natasha.
              </p>
            )}
          </div>

          {/* Paragraph Reactions Row */}
          {document.reactions && document.reactions.length > 0 && (
            <div className="mt-8 pt-4 border-t border-[#f0e5d5] dark:border-[#2b251e] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#8c7e6b] font-sans text-[10px] uppercase tracking-wider">
                Reactions on this page:
              </span>
              {document.reactions.map((rx) => {
                const rxAuthor = [currentAuthor, coAuthor].find(
                  (a) => a.id === rx.authorId
                );
                return (
                  <span
                    key={rx.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f4ebd9] dark:bg-[#28221c] border border-[#e5dad0] text-sm"
                    title={`Reacted by ${rxAuthor?.name || 'Co-author'}`}
                  >
                    <span>{rx.emoji}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Selection Annotation Popover */}
      {selectedText && selectionRange && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-[#2c241c] text-[#f7e7ce] p-2.5 rounded-xl shadow-2xl border border-amber-600/30 max-w-sm w-72 animate-in fade-in zoom-in-95"
          style={{
            left: `${selectionRange.x}px`,
            top: `${selectionRange.y - 10}px`,
          }}
        >
          <div className="text-[10px] font-sans uppercase tracking-wider text-amber-300/80 mb-1 font-semibold flex items-center justify-between">
            <span>Annotate Selection</span>
            <button
              onClick={() => {
                setSelectedText('');
                setSelectionRange(null);
              }}
              className="text-amber-200/60 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs italic text-amber-100 line-clamp-2 border-l border-amber-500/50 pl-1.5 mb-2">
            "{selectedText}"
          </p>

          {!showAnnotationPopover ? (
            <button
              onClick={() => setShowAnnotationPopover(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-lg text-xs font-serif font-medium transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Margin Note</span>
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={annotationNote}
                onChange={(e) => setAnnotationNote(e.target.value)}
                placeholder="Write your margin reflection..."
                rows={2}
                autoFocus
                className="w-full p-2 bg-[#1c1712] border border-amber-700/40 rounded text-xs text-amber-100 placeholder-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-serif"
              />
              <button
                onClick={handleAddSelectionAnnotation}
                disabled={!annotationNote.trim()}
                className="w-full py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
              >
                Save Annotation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#fbf8f3] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#3a3229] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-serif text-xs">
            <div className="flex items-center justify-between border-b border-[#f0e5d5] pb-2">
              <h3 className="font-serif font-bold text-base text-[#1c1917] dark:text-[#f3e7d3] flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-700" />
                <span>Upload or Link Memory Photo</span>
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-1 hover:bg-[#efe6d8] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Supabase File Upload Option */}
            <div className="p-3 rounded-xl bg-amber-900/5 dark:bg-amber-100/5 border border-dashed border-amber-800/30 text-center space-y-2 font-sans">
              <label className="cursor-pointer block text-xs font-medium text-amber-900 dark:text-amber-300 hover:underline">
                {isUploadingImage ? (
                  <span className="animate-pulse flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> Uploading image to Supabase Storage ('poem-images')...
                  </span>
                ) : (
                  <span>📁 Click to Upload Photo directly to Supabase Bucket ('poem-images')</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-[#8c7e6b]">
                Supports JPG, PNG, WEBP (stored in public 'poem-images' bucket)
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1">
                Or Enter Public Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1">
                Caption / Memory Note
              </label>
              <input
                type="text"
                placeholder="Pressed flower in autumn journal..."
                value={imageCaptionInput}
                onChange={(e) => setImageCaptionInput(e.target.value)}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 rounded text-xs hover:bg-[#efe6d8]"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertImage}
                disabled={!imageUrlInput.trim() || isUploadingImage}
                className="px-4 py-1.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-40"
              >
                Insert Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Capsule Modal */}
      {showTimeCapsuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#fbf8f3] dark:bg-[#201c18] border border-[#ebd2b4] dark:border-[#3a3229] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-serif text-xs">
            <div className="flex items-center justify-between border-b border-[#f0e5d5] pb-2">
              <h3 className="font-serif font-bold text-base text-[#1c1917] dark:text-[#f3e7d3] flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-700" />
                <span>Time Capsule Seal</span>
              </h3>
              <button
                onClick={() => setShowTimeCapsuleModal(false)}
                className="p-1 hover:bg-[#efe6d8] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c5040] dark:text-[#b8aa96] leading-relaxed">
              Lock this poem until a future date or anniversary. When locked, the content remains hidden in reader mode until the unlock date arrives.
            </p>

            <div>
              <label className="block text-[10px] font-sans uppercase tracking-wider text-[#8c7e6b] mb-1 font-bold">
                Unlock Date:
              </label>
              <input
                type="date"
                value={unlockDateInput}
                onChange={(e) => setUnlockDateInput(e.target.value)}
                className="w-full p-2 bg-[#efe6d8] dark:bg-[#181512] border border-[#dfd5c5] rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 font-sans"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              {document.isTimeCapsule && (
                <button
                  onClick={() => {
                    setUnlockDateInput('');
                    onUpdateDocument({
                      ...document,
                      isTimeCapsule: false,
                      timeCapsuleUnlockDate: undefined,
                    });
                    setShowTimeCapsuleModal(false);
                  }}
                  className="text-rose-700 text-xs font-sans hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Remove Seal
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowTimeCapsuleModal(false)}
                  className="px-3 py-1.5 rounded text-xs hover:bg-[#efe6d8]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTimeCapsule}
                  className="px-4 py-1.5 bg-[#2c241c] dark:bg-[#ebdcc8] text-[#f7e7ce] dark:text-[#2c241c] rounded-lg text-xs font-semibold hover:opacity-90"
                >
                  Save Time Capsule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};