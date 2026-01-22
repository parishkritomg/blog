'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon, Undo, Redo, Heading1, Heading2, RemoveFormatting
} from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] p-8 bg-white',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            icon={<Undo size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            icon={<Redo size={16} />}
          />
          
          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive('bold')}
            icon={<Bold size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive('italic')}
            icon={<Italic size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            active={editor.isActive('underline')}
            icon={<UnderlineIcon size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            active={editor.isActive('strike')}
            icon={<Strikethrough size={16} />}
          />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            active={editor.isActive('heading', { level: 2 })}
            icon={<Heading1 size={16} />}
            label="H1"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
            active={editor.isActive('heading', { level: 3 })}
            icon={<Heading2 size={16} />}
            label="H2"
          />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('left').run()} 
            active={editor.isActive({ textAlign: 'left' })}
            icon={<AlignLeft size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
            active={editor.isActive({ textAlign: 'center' })}
            icon={<AlignCenter size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('right').run()} 
            active={editor.isActive({ textAlign: 'right' })}
            icon={<AlignRight size={16} />}
          />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            active={editor.isActive('bulletList')}
            icon={<List size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            active={editor.isActive('orderedList')}
            icon={<ListOrdered size={16} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            active={editor.isActive('blockquote')}
            icon={<Quote size={16} />}
          />

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <ToolbarButton 
            onClick={setLink}
            active={editor.isActive('link')}
            icon={<LinkIcon size={16} />}
          />
          <ToolbarButton 
            onClick={addImage}
            icon={<ImageIcon size={16} />}
          />
          
          <div className="flex-grow" />
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            icon={<RemoveFormatting size={16} />}
          />
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ 
  onClick, 
  active = false, 
  disabled = false, 
  icon,
  label
}: { 
  onClick: () => void; 
  active?: boolean; 
  disabled?: boolean; 
  icon: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-1.5 rounded transition-colors flex items-center gap-1
        ${active ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={label}
    >
      {icon}
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
}
