"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useRef, useState } from "react";
import { FiBold, FiItalic, FiLink, FiImage } from "react-icons/fi";
import { LuHeading1 } from "react-icons/lu";
import { RiDoubleQuotesL } from "react-icons/ri";
import axiosInstance from "@/lib/axios";

export default function WritePage() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState(["Editorial", "Minimalism"]);
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
      Placeholder.configure({ placeholder: "Write your story..." }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[300px] text-gray-800 leading-relaxed",
      },
    },
    onUpdate: () => forceUpdate({}),
    onSelectionUpdate: () => forceUpdate({}),
  });

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;
  const minRead = Math.max(0, Math.ceil(wordCount / 200));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (contentImages.length >= 3) {
      alert("You can only upload up to 3 images.");
      return;
    }
    const index = contentImages.length;
    setContentImages((prev) => [...prev, file]);
    const previewUrl = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src: previewUrl, alt: `__IMAGE_${index}__` }).run();
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
    tags.forEach((t) => formData.append("tag[]", t));
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    contentImages.forEach((file) => formData.append("content_images", file));
    try {
      setIsPublishing(true);
      const res = await axiosInstance.post("/blog/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPublishSuccess(true);
      console.log(res.data);
    } catch (err: any) {
      setPublishError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleHeading = useCallback(() => editor?.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index));

  const toolbarBtn = (active: boolean) =>
    `p-2 rounded-md transition-all ${active ? "bg-[#985F2E] text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* hidden inputs */}
      <input ref={editorImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditorImageUpload} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

      {/* ── Write sub-header ── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b border-[#E5E5E5]">
        <div className="max-w-[760px] mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Draft saved</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {wordCount > 0 ? `${wordCount} words · ${minRead} min read` : ""}
            </span>
            {publishError && (
              <span className="text-xs text-red-500">{publishError}</span>
            )}
            {publishSuccess && (
              <span className="text-xs text-green-600 font-medium">Published!</span>
            )}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-1.5 bg-[#985F2E] text-white text-sm font-bold rounded-lg hover:bg-[#7A4A22] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Cover Image Zone ── */}
      <div
        className="w-full cursor-pointer relative overflow-hidden group"
        style={{ backgroundColor: "#985F2E", minHeight: "220px" }}
        onClick={() => fileInputRef.current?.click()}
      >
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt="Cover"
              className="w-full block object-cover"
              style={{ maxHeight: "340px", width: "100%", objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-lg">
                Change Cover
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center" style={{ minHeight: "220px" }}>
            <svg className="w-8 h-8 text-white/40 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
              Add a Cover Image
            </span>
          </div>
        )}
      </div>

      {/* ── Editor Area ── */}
      <div className="max-w-[760px] mx-auto w-full px-6 sm:px-10 pb-40">
        {/* Title */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your story..."
          rows={1}
          className="w-full mt-10 text-4xl sm:text-5xl font-black tracking-tight outline-none resize-none leading-tight placeholder:text-gray-200 overflow-hidden"
          style={{ lineHeight: "1.1" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />

        {/* Subtitle */}
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Add a subtitle..."
          rows={1}
          className="w-full mt-4 text-xl outline-none resize-none text-gray-400 placeholder:text-gray-200 leading-relaxed overflow-hidden"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />

        <div className="mt-6 mb-8 border-t border-[#E5E5E5]" />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F0EB] text-[#985F2E] text-xs font-bold rounded-full"
            >
              {tag}
              <button
                onClick={() => removeTag(i)}
                className="text-[#985F2E]/60 hover:text-[#985F2E] transition-colors leading-none"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag..."
            className="text-xs text-gray-400 outline-none bg-transparent w-24 placeholder:text-gray-300"
          />
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} className="tiptap" />
      </div>

      {/* ── Floating Toolbar (fixed at bottom) ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl shadow-xl border border-white/10"
          style={{ backgroundColor: "#2A1A08" }}>
          <button onClick={toggleBold} className={toolbarBtn(editor?.isActive("bold") ?? false)} title="Bold">
            <FiBold size={15} />
          </button>
          <button onClick={toggleItalic} className={toolbarBtn(editor?.isActive("italic") ?? false)} title="Italic">
            <FiItalic size={15} />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={toggleHeading} className={toolbarBtn(editor?.isActive("heading", { level: 1 }) ?? false)} title="Heading">
            <LuHeading1 size={15} />
          </button>
          <button onClick={toggleBlockquote} className={toolbarBtn(editor?.isActive("blockquote") ?? false)} title="Blockquote">
            <RiDoubleQuotesL size={15} />
          </button>
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button onClick={setLink} className={toolbarBtn(editor?.isActive("link") ?? false)} title="Link">
            <FiLink size={15} />
          </button>
          <button
            onClick={() => editorImageInputRef.current?.click()}
            className={toolbarBtn(false)}
            title="Image"
          >
            <FiImage size={15} />
            {contentImages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#985F2E] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {contentImages.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
