"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useRef, useState } from "react";
import { FiBold, FiItalic, FiLink, FiImage } from "react-icons/fi";
import { RiDoubleQuotesL } from "react-icons/ri";
import { FiList } from "react-icons/fi";
import axiosInstance from "@/lib/axios";

export default function WritePage() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [contentImages, setContentImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState({});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your story…" }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[280px]",
      },
    },
    onUpdate: () => forceUpdate({}),
    onSelectionUpdate: () => forceUpdate({}),
  });

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;
  const minRead = Math.max(1, Math.ceil(wordCount / 200));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCoverImageFile(file); setCoverImage(URL.createObjectURL(file)); }
  };

  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (contentImages.length >= 3) { alert("Max 3 images."); return; }
    const index = contentImages.length;
    setContentImages(prev => [...prev, file]);
    editor.chain().focus().setImage({ src: URL.createObjectURL(file), alt: `__IMAGE_${index}__` }).run();
  };

  const handlePublish = async () => {
    setPublishError(null);
    setPublishSuccess(false);
    const content = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";
    if (!title.trim()) return setPublishError("Title is required.");
    if (!subtitle.trim()) return setPublishError("Description is required.");
    if (!textContent) return setPublishError("Content cannot be empty.");
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", subtitle.trim());
    formData.append("content", content);
    tags.forEach(t => formData.append("tag[]", t));
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    contentImages.forEach(f => formData.append("content_images", f));
    try {
      setIsPublishing(true);
      await axiosInstance.post("/blog/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setPublishSuccess(true);
    } catch (err: any) {
      setPublishError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleH1 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleH2 = useCallback(() => editor?.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) setTags(prev => [...prev, tagInput.trim()]);
    setTagInput("");
  };

  const tbBtn = (active: boolean) =>
    `w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
      active
        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
    }`;

  return (
    <div className="min-h-screen">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={editorImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditorImageUpload} />

      {/* ══ TOP BAR ══ */}
      <div className="sticky top-16 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600/70" />
            {wordCount > 0 ? `${wordCount} words · ${minRead} min read` : "New story"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:block">{tags.length} tag{tags.length === 1 ? "" : "s"}</span>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="h-8 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isPublishing && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isPublishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <main>
        {/* ══ COVER UPLOAD ══ */}
        {coverImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-full aspect-[21/6] min-h-[160px] border-b border-zinc-200 dark:border-zinc-800 overflow-hidden block"
          >
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium">
              <FiImage size={15} />
              Change cover
            </span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group w-full aspect-[21/6] min-h-[160px] bg-zinc-50 dark:bg-zinc-900 border-b border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-sm font-medium">Add a cover image</span>
            <span className="text-xs">Drag &amp; drop or click · 1600×900 recommended</span>
          </button>
        )}

        {/* ══ EDITOR ══ */}
        <div className="max-w-2xl mx-auto px-6 pt-12 pb-32">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of your story…"
            className="w-full text-4xl font-bold tracking-[-0.03em] leading-tight bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 resize-none"
            onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle…"
            className="w-full text-lg text-zinc-500 bg-transparent outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 mb-8"
          />

          {/* Floating toolbar */}
          <div className="sticky top-[120px] z-30 flex justify-center mb-10">
            <div
              className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-1"
              role="toolbar"
              aria-label="Formatting"
            >
              <button className={`${tbBtn(editor?.isActive("bold") ?? false)} text-sm font-bold`} onClick={toggleBold} aria-label="Bold"><FiBold size={13} /></button>
              <button className={`${tbBtn(editor?.isActive("italic") ?? false)} text-sm italic`} onClick={toggleItalic} aria-label="Italic"><FiItalic size={13} /></button>
              <span className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
              <button className={`${tbBtn(editor?.isActive("heading", { level: 1 }) ?? false)} text-xs font-bold`} onClick={toggleH1} aria-label="Heading 1">H1</button>
              <button className={`${tbBtn(editor?.isActive("heading", { level: 2 }) ?? false)} text-xs font-bold`} onClick={toggleH2} aria-label="Heading 2">H2</button>
              <span className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
              <button className={tbBtn(editor?.isActive("blockquote") ?? false)} onClick={toggleBlockquote} aria-label="Blockquote"><RiDoubleQuotesL size={13} /></button>
              <button className={tbBtn(editor?.isActive("link") ?? false)} onClick={setLink} aria-label="Link"><FiLink size={13} /></button>
              <button className={tbBtn(editor?.isActive("bulletList") ?? false)} onClick={toggleList} aria-label="Bullet list"><FiList size={13} /></button>
              <span className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
              <button
                className="h-8 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
                onClick={() => editorImageInputRef.current?.click()}
                aria-label={`Insert image, ${contentImages.length} of 3 used`}
              >
                <FiImage size={13} />
                <span className="text-[10px] text-zinc-400 font-mono">{contentImages.length}/3</span>
              </button>
            </div>
          </div>

          {/* Editor body */}
          <EditorContent editor={editor} />

          {/* Word count */}
          <p className="text-xs text-zinc-400 font-mono mt-10">{wordCount} words · {minRead} min read</p>

          {/* Error / success */}
          {publishError && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600/80 shrink-0" />
              <span className="flex-1 font-medium">{publishError}</span>
            </div>
          )}
          {publishSuccess && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600/80 shrink-0" />
              <span className="flex-1 font-medium">Story published.</span>
            </div>
          )}

          {/* ══ TAGS ══ */}
          <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-3">Tags</p>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-sm font-medium">
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((_, j) => j !== i))}
                    className="w-4 h-4 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs"
                    aria-label={`Remove ${tag} tag`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(); }
                  if (e.key === "Backspace" && !tagInput && tags.length > 0) setTags(tags.slice(0, -1));
                }}
                placeholder="Add tag… (Enter)"
                className="h-8 px-2 bg-transparent outline-none text-sm placeholder:text-zinc-400 border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors w-36"
              />
            </div>
          </div>
        </div>
      </main>

      {/* ══ STORY PREVIEW PANEL ══ */}
      <aside
        className="hidden xl:block fixed right-6 top-40 w-72 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-5"
        aria-label="Publish settings"
      >
        <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-400 mb-4">Story preview</h2>
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-5">
          <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[10px] font-mono text-zinc-400 overflow-hidden">
            {coverImage ? <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" /> : "cover preview"}
          </div>
          <div className="p-3">
            <p className="text-sm font-bold leading-snug mb-1 line-clamp-2">{title || "Title of your story…"}</p>
            <p className="text-xs text-zinc-400">{minRead} min read</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-5">
          {tags.length ? `Tags: ${tags.join(", ")}` : "No tags yet"}
        </p>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full h-9 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPublishing ? "Publishing…" : "Confirm & publish"}
        </button>
      </aside>
    </div>
  );
}
