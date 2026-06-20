"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiBold, FiItalic, FiLink, FiImage } from "react-icons/fi";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { RiDoubleQuotesL } from "react-icons/ri";
import { FiList } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";

const ACCENT  = "#995F2F";
const ACCENT2 = "#7A4A22";
const BORDER  = "#E5E5E5";
const MUTED   = "#666666";
const SURFACE = "#F5F5F5";

export default function EditBlogPage() {
  const { blogId } = useParams() as { blogId: string };
  const router = useRouter();

  const [loadingBlog, setLoadingBlog]       = useState(true);
  const [notOwner, setNotOwner]             = useState(false);

  const [coverImageUrl, setCoverImageUrl]   = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [title, setTitle]                   = useState("");
  const [subtitle, setSubtitle]             = useState("");
  const [tags, setTags]                     = useState<string[]>([]);
  const [tagInput, setTagInput]             = useState("");
  const [isSaving, setIsSaving]             = useState(false);
  const [saveError, setSaveError]           = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess]       = useState(false);
  const [contentImages, setContentImages]   = useState<File[]>([]);
  const [, forceUpdate]                     = useState({});

  const fileInputRef        = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

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
        class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-800 leading-relaxed",
      },
    },
    onUpdate: () => forceUpdate({}),
    onSelectionUpdate: () => forceUpdate({}),
  });

  // Fetch blog + current user, guard ownership
  useEffect(() => {
    if (!blogId) return;
    const load = async () => {
      try {
        setLoadingBlog(true);
        const [blogRes, userRes] = await Promise.all([
          axiosInstance.get(`/blog/${blogId}`),
          axiosInstance.get("/users/current-user").catch(() => null),
        ]);
        const blog = blogRes.data.data;
        const user = userRes?.data?.data;

        if (!user || user._id !== blog.author._id) {
          setNotOwner(true);
          return;
        }

        setTitle(blog.title ?? "");
        setSubtitle(blog.description ?? "");
        setTags(blog.tag ?? []);
        setCoverImageUrl(blog.coverImage?.url ?? null);

        if (editor && blog.content) {
          editor.commands.setContent(blog.content);
        }
      } catch (err) {
        console.error("Failed to load blog for editing:", err);
      } finally {
        setLoadingBlog(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  // Set editor content after editor is ready
  useEffect(() => {
    if (!editor || !loadingBlog) return;
    // re-attempt if editor wasn't ready during first fetch
    const trySet = async () => {
      try {
        const res = await axiosInstance.get(`/blog/${blogId}`);
        const html = res.data.data?.content;
        if (html) editor.commands.setContent(html);
      } catch { /* already loaded */ }
    };
    trySet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (notOwner) {
    router.replace(`/blog/${blogId}`);
    return null;
  }

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;
  const minRead   = Math.max(1, Math.ceil(wordCount / 200));

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImageUrl(URL.createObjectURL(file));
    }
  };

  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (contentImages.length >= 3) { alert("Max 3 images per edit."); return; }
    const index = contentImages.length;
    setContentImages(prev => [...prev, file]);
    editor.chain().focus().setImage({ src: URL.createObjectURL(file), alt: `__IMAGE_${index}__` }).run();
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    const content     = editor?.getHTML() ?? "";
    const textContent = editor?.getText().trim() ?? "";
    if (!title.trim())    return setSaveError("Title is required.");
    if (!subtitle.trim()) return setSaveError("Description is required.");
    if (!textContent)     return setSaveError("Content cannot be empty.");

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", subtitle.trim());
    formData.append("content", content);
    tags.forEach(t => formData.append("tag[]", t));
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    contentImages.forEach(f => formData.append("content_images", f));

    try {
      setIsSaving(true);
      await axiosInstance.patch(`/blog/${blogId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSaveSuccess(true);
      setTimeout(() => router.push(`/blog/${blogId}`), 800);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBold       = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic     = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleH1         = useCallback(() => editor?.chain().focus().toggleHeading({ level: 1 }).run(), [editor]);
  const toggleH2         = useCallback(() => editor?.chain().focus().toggleHeading({ level: 2 }).run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleList       = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const setLink          = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const tbBtn = (active: boolean) => ({
    display: "flex" as const, alignItems: "center" as const, justifyContent: "center" as const,
    width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer",
    background: active ? ACCENT : "transparent",
    color: active ? "#fff" : MUTED,
    transition: "all 0.15s",
  });

  if (loadingBlog) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", color: "#171C20", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
      <style>{`
        .write-layout { display: grid; grid-template-columns: 1fr 300px; gap: 40px; }
        @media (max-width: 900px) { .write-layout { grid-template-columns: 1fr; } .write-sidebar { display: none !important; } }
        .tb-btn:hover { background: ${SURFACE} !important; color: #1A1A1A !important; }
        .tb-btn-active:hover { background: ${ACCENT2} !important; }
        .tiptap h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 24px 0 12px; }
        .tiptap h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; margin: 20px 0 10px; }
        .tiptap p  { font-size: 17px; line-height: 1.8; margin-bottom: 16px; color: #1A1A1A; }
        .tiptap blockquote { border-left: 3px solid ${ACCENT}; padding: 12px 20px; margin: 20px 0; background: rgba(153,95,47,0.05); border-radius: 0 8px 8px 0; font-style: italic; color: ${MUTED}; }
        .tiptap ul { padding-left: 24px; margin-bottom: 16px; }
        .tiptap li { font-size: 17px; line-height: 1.8; margin-bottom: 6px; }
        .tiptap a  { color: ${ACCENT}; text-decoration: underline; }
        .tiptap img { border-radius: 10px; margin: 20px 0; width: 100%; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #CCC; pointer-events: none; height: 0; }
        .cover-upload:hover .cover-overlay { opacity: 1 !important; }
        .tag-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background: rgba(153,95,47,0.12); color: ${ACCENT}; border: 1px solid rgba(153,95,47,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Hidden file inputs */}
      <input ref={fileInputRef}        type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
      <input ref={editorImageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleEditorImageUpload} />

      {/* ── Page header ── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <button
              onClick={() => router.push(`/blog/${blogId}`)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: MUTED, background: "transparent", border: "none", cursor: "pointer", padding: "0 0 10px", fontFamily: "inherit", transition: "color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#1A1A1A"; }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; }}
            >
              <ArrowLeft size={14} /> Back to article
            </button>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 }}>Editing</p>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: "#171C20" }}>Edit Story</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {wordCount > 0 && (
              <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{wordCount} words · {minRead} min read</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div className="write-layout">

          {/* ── Editor column ── */}
          <div>
            {/* Formatting toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "8px 12px", background: SURFACE, borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 28, flexWrap: "wrap" }}>
              <button className="tb-btn" style={tbBtn(editor?.isActive("bold") ?? false)} onClick={toggleBold} title="Bold"><FiBold size={14} /></button>
              <button className="tb-btn" style={tbBtn(editor?.isActive("italic") ?? false)} onClick={toggleItalic} title="Italic"><FiItalic size={14} /></button>
              <div style={{ width: 1, height: 20, background: BORDER, margin: "0 6px" }} />
              <button className="tb-btn" style={tbBtn(editor?.isActive("heading", { level: 1 }) ?? false)} onClick={toggleH1} title="Heading 1"><LuHeading1 size={16} /></button>
              <button className="tb-btn" style={tbBtn(editor?.isActive("heading", { level: 2 }) ?? false)} onClick={toggleH2} title="Heading 2"><LuHeading2 size={16} /></button>
              <button className="tb-btn" style={tbBtn(editor?.isActive("blockquote") ?? false)} onClick={toggleBlockquote} title="Blockquote"><RiDoubleQuotesL size={14} /></button>
              <button className="tb-btn" style={tbBtn(editor?.isActive("bulletList") ?? false)} onClick={toggleList} title="List"><FiList size={14} /></button>
              <div style={{ width: 1, height: 20, background: BORDER, margin: "0 6px" }} />
              <button className="tb-btn" style={tbBtn(editor?.isActive("link") ?? false)} onClick={setLink} title="Link"><FiLink size={14} /></button>
              <button className="tb-btn" style={tbBtn(false)} onClick={() => editorImageInputRef.current?.click()} title="Insert image">
                <FiImage size={14} />
                {contentImages.length > 0 && (
                  <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, color: ACCENT }}>{contentImages.length}</span>
                )}
              </button>
            </div>

            {/* Title */}
            <textarea
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title of your story…"
              rows={1}
              style={{
                width: "100%", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900,
                letterSpacing: "-0.03em", lineHeight: 1.1, border: "none", outline: "none",
                resize: "none", background: "transparent", color: "#171C20",
                fontFamily: "inherit", marginBottom: 14, overflow: "hidden",
              }}
              onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
            />

            {/* Description */}
            <textarea
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="Write a short description…"
              rows={1}
              style={{
                width: "100%", fontSize: 18, fontWeight: 400, lineHeight: 1.6,
                border: "none", outline: "none", resize: "none", background: "transparent",
                color: MUTED, fontFamily: "inherit", marginBottom: 24, overflow: "hidden",
              }}
              onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
            />

            <div style={{ height: 1, background: BORDER, marginBottom: 28 }} />

            {/* Editor */}
            <EditorContent editor={editor} className="tiptap" />

            {/* Error / success */}
            {saveError && (
              <div style={{ marginTop: 20, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 13, color: "#DC2626" }}>
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid #86EFAC", borderRadius: 8, fontSize: 13, color: "#16A34A", fontWeight: 600 }}>
                Changes saved! Redirecting…
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="write-sidebar" style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Cover image */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", background: SURFACE }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>Cover Image</span>
              </div>
              <div
                className="cover-upload"
                onClick={() => fileInputRef.current?.click()}
                style={{ position: "relative", cursor: "pointer", aspectRatio: "16/9", background: "#EEE" }}
              >
                {coverImageUrl ? (
                  <>
                    <img src={coverImageUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div className="cover-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", opacity: 0, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 6 }}>Change</span>
                    </div>
                  </>
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 120 }}>
                    <svg width="28" height="28" fill="none" stroke="#BBB" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                    <span style={{ fontSize: 11, color: "#BBB", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Upload cover</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: "#fff" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>Tags</span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length ? 10 : 0 }}>
                  {tags.map((tag, i) => (
                    <span key={i} className="tag-pill">
                      {tag}
                      <button
                        onClick={() => setTags(tags.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, lineHeight: 1, fontSize: 14 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      if (!tags.includes(tagInput.trim())) setTags(prev => [...prev, tagInput.trim()]);
                      setTagInput("");
                    }
                    if (e.key === "Backspace" && !tagInput && tags.length > 0) setTags(tags.slice(0, -1));
                  }}
                  placeholder="Add a tag, press Enter…"
                  style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#1A1A1A", background: "transparent", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Stats */}
            {wordCount > 0 && (
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", background: SURFACE }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Story stats</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT, letterSpacing: "-0.02em" }}>{wordCount}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>words</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT, letterSpacing: "-0.02em" }}>{minRead}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>min read</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT, letterSpacing: "-0.02em" }}>{tags.length}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>tags</div>
                  </div>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: isSaving ? "#C8A882" : ACCENT,
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = ACCENT2; }}
              onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background = ACCENT; }}
            >
              {isSaving && <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>

            {/* Discard */}
            <button
              onClick={() => router.push(`/blog/${blogId}`)}
              style={{
                width: "100%", padding: "11px", borderRadius: 10,
                border: `1.5px solid ${BORDER}`, background: "transparent",
                color: MUTED, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#CCCCCC"; e.currentTarget.style.color = "#1A1A1A"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
            >
              Discard Changes
            </button>

          </aside>
        </div>
      </div>
    </div>
  );
}
