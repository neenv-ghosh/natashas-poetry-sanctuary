import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Calendar,
  Smile,
  Search,
  Undo,
  Redo,
  ChevronDown,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { FONT_LIBRARY } from '../data/fonts';

interface FormattingToolbarProps {
  editor: Editor | null;
  onOpenImageModal: () => void;
  onOpenFindReplace: () => void;
  onInsertDate: () => void;
  onInsertSymbol: (symbol: string) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  editor,
  onOpenImageModal,
  onOpenFindReplace,
  onInsertDate,
  onInsertSymbol,
}) => {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showSymbolMenu, setShowSymbolMenu] = useState(false);

  if (!editor) return null;

  const textColors = [
    '#1c1917', // Dark Walnut
    '#9a3412', // Terracotta
    '#b45309', // Warm Amber
    '#15803d', // Deep Forest Green
    '#1e3a8a', // Indigo
    '#7e22ce', // Royal Purple
    '#be123c', // Burgundy
    '#78716c', // Slate Grey
  ];

  const highlightColors = [
    '#fef08a', // Gentle Yellow
    '#fed7aa', // Peach / Apricot
    '#bbf7d0', // Mint Green
    '#bfdbfe', // Soft Sky Blue
    '#fbcfe8', // Petal Pink
    '#e9d5ff', // Lavender
  ];

  const symbols = ['—', '…', '“', '”', '‘', '’', '•', '†', '‡', '§', '¶', '❦', '❧', '✦', '✧', '❁', '✿'];

  const currentFontFamily = FONT_LIBRARY.find((f) =>
    editor.isActive('textStyle', { fontFamily: f.family })
  )?.name || 'Cormorant Garamond';

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1 p-1.5 bg-[#f8f4ed]/95 dark:bg-[#201c18]/95 backdrop-blur-md border-b border-[#e5dcd0] dark:border-[#332c24] text-[#42382c] dark:text-[#d6c7b2] shadow-xs text-xs">
      {/* Undo & Redo */}
      <div className="flex items-center border-r border-[#e5dcd0] dark:border-[#332c24] pr-1 mr-0.5">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] disabled:opacity-30"
          title="Undo (⌘Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] disabled:opacity-30"
          title="Redo (⌘⇧Z)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Font Family Selector */}
      <div className="relative border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5">
        <button
          onClick={() => setShowFontMenu(!showFontMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#efe6d8] dark:bg-[#2b251e] border border-[#ded5c6] dark:border-[#3d3429] hover:border-amber-800/40 text-xs font-serif min-w-[120px] justify-between"
        >
          <span className="truncate">{currentFontFamily}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-[#fbf8f3] dark:bg-[#221e19] border border-[#e5dad0] dark:border-[#3a3229] rounded-xl shadow-xl p-1 max-h-64 overflow-y-auto">
            {FONT_LIBRARY.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  editor.chain().focus().setFontFamily(f.family).run();
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f0e8db] dark:hover:bg-[#2d2720] text-xs flex flex-col"
              >
                <span style={{ fontFamily: f.family }} className="font-medium text-sm">
                  {f.name}
                </span>
                <span className="text-[10px] text-[#8c7e6b] truncate">{f.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Heading / Style Selector */}
      <div className="relative border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5">
        <button
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#efe6d8] dark:bg-[#2b251e] border border-[#ded5c6] dark:border-[#3d3429] hover:border-amber-800/40 text-xs font-serif min-w-[100px] justify-between"
        >
          <span className="truncate">
            {editor.isActive('heading', { level: 1 })
              ? 'Heading 1'
              : editor.isActive('heading', { level: 2 })
              ? 'Heading 2'
              : editor.isActive('heading', { level: 3 })
              ? 'Heading 3'
              : 'Normal Text'}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showHeadingMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 w-44 bg-[#fbf8f3] dark:bg-[#221e19] border border-[#e5dad0] dark:border-[#3a3229] rounded-xl shadow-xl p-1">
            <button
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setShowHeadingMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f0e8db] dark:hover:bg-[#2d2720] text-xs"
            >
              Normal Text
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setShowHeadingMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f0e8db] dark:hover:bg-[#2d2720] text-sm font-serif font-bold"
            >
              Heading 1
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setShowHeadingMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f0e8db] dark:hover:bg-[#2d2720] text-xs font-serif font-semibold"
            >
              Heading 2
            </button>
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setShowHeadingMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#f0e8db] dark:hover:bg-[#2d2720] text-xs font-serif"
            >
              Heading 3
            </button>
          </div>
        )}
      </div>

      {/* Formatting Toggles: Bold, Italic, Underline, Strikethrough */}
      <div className="flex items-center gap-0.5 border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('bold') ? 'bg-amber-900/15 text-amber-900 font-bold' : ''
          }`}
          title="Bold (⌘B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('italic') ? 'bg-amber-900/15 text-amber-900 font-bold' : ''
          }`}
          title="Italic (⌘I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('underline') ? 'bg-amber-900/15 text-amber-900 font-bold' : ''
          }`}
          title="Underline (⌘U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('strike') ? 'bg-amber-900/15 text-amber-900 font-bold' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Color & Highlight Pickers */}
      <div className="flex items-center gap-0.5 border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5 relative">
        {/* Text Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-[#fbf8f3] dark:bg-[#221e19] border border-[#e5dad0] dark:border-[#3a3229] rounded-xl shadow-xl grid grid-cols-4 gap-1.5">
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
              editor.isActive('highlight') ? 'bg-amber-200 dark:bg-amber-900/40' : ''
            }`}
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-[#fbf8f3] dark:bg-[#221e19] border border-[#e5dad0] dark:border-[#3a3229] rounded-xl shadow-xl grid grid-cols-3 gap-1.5">
              {highlightColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-amber-900/15' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-amber-900/15' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-amber-900/15' : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5 border-r border-[#e5dcd0] dark:border-[#332c24] pr-1.5 mr-0.5">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('bulletList') ? 'bg-amber-900/15' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('orderedList') ? 'bg-amber-900/15' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720] ${
            editor.isActive('blockquote') ? 'bg-amber-900/15' : ''
          }`}
          title="Quote Block"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
          title="Insert Horizontal Divider"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inserts: Image, Date, Symbols */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onOpenImageModal}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onInsertDate}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
          title="Insert Current Date"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>

        {/* Special Symbols */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolMenu(!showSymbolMenu)}
            className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
            title="Literary Symbols & Em-dash"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          {showSymbolMenu && (
            <div className="absolute top-full right-0 mt-1 z-50 p-2 bg-[#fbf8f3] dark:bg-[#221e19] border border-[#e5dad0] dark:border-[#3a3229] rounded-xl shadow-xl grid grid-cols-6 gap-1 w-48 text-center font-serif text-sm">
              {symbols.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    onInsertSymbol(sym);
                    setShowSymbolMenu(false);
                  }}
                  className="p-1 rounded hover:bg-[#eae0d0] dark:hover:bg-[#2e2720]"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Find & Replace */}
        <button
          onClick={onOpenFindReplace}
          className="p-1.5 rounded hover:bg-[#ebdcc8] dark:hover:bg-[#2d2720]"
          title="Find & Replace (⌘F)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
