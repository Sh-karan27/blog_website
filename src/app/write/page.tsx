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

  const fileInputRef = useRef<HTMLInputElement>(null); // cover image
  const editorImageInputRef = useRef<HTMLInputElement>(null); // editor image
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
          "prose prose-lg max-w-none focus:outline-none min-h-[200px] text-gray-800 leading-relaxed",
      },
    },
    onUpdate: () => {
      forceUpdate({}); // 👈 THIS fixes active state UI
    },
    onSelectionUpdate: () => {
      forceUpdate({}); // 👈 ALSO needed for cursor movement
    },
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

  // ✅ editor image handler
  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // 🚫 limit 3 images
    if (contentImages.length >= 3) {
      alert("You can only upload up to 3 images.");
      return;
    }

    const index = contentImages.length;

    // store file
    setContentImages((prev) => [...prev, file]);

    const previewUrl = URL.createObjectURL(file);

    editor
      .chain()
      .focus()
      .setImage({
        src: previewUrl,          // ✅ show image
        alt: `__IMAGE_${index}__` // ✅ store mapping
      })
      .run();
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

    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    // 🔥 ADD THIS
    contentImages.forEach((file) => {
      formData.append("content_images", file);
    });

    try {
      setIsPublishing(true);

      const res = await axiosInstance.post("/blog/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPublishSuccess(true);
      console.log(res.data);
    } catch (err: any) {
      setPublishError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleBold = useCallback(
    () => editor?.chain().focus().toggleBold().run(),
    [editor],
  );
  const toggleItalic = useCallback(
    () => editor?.chain().focus().toggleItalic().run(),
    [editor],
  );
  const toggleHeading = useCallback(
    () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    [editor],
  );
  const toggleBlockquote = useCallback(
    () => editor?.chain().focus().toggleBlockquote().run(),
    [editor],
  );
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

  const removeTag = (index: number) =>
    setTags(tags.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-white flex flex-col font-serif">
      <style>{`
        .toolbar-btn svg {
            stroke-width: 2;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #c4bfba;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .tiptap:focus { outline: none; }
        .tiptap img {
          border-radius: 8px;
          margin: 24px 0;
          width: 100%;
        }
      `}</style>

      {/* hidden input for editor images */}
      <input
        ref={editorImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleEditorImageUpload}
      />

      {/* Cover Image */}
      <div
        className="w-full cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: "#000", minHeight: "220px" }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
        {coverImage ? (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full block"
            style={{
              maxWidth: "75%",
              height: "50vh",
              objectFit: "contain",
            }}
          />
        ) : (
          <span className="text-gray-400 uppercase text-sm">
            Add a Cover Image
          </span>
        )}
      </div>

      {/* Main */}
      <div className="max-w-[760px] mx-auto w-full px-10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your story..."
          className="w-full mt-10 text-4xl outline-none"
        />

        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle..."
          className="w-full mt-2 text-lg outline-none text-gray-500"
        />

        {/* Toolbar */}
        <div className="mt-10 mb-6 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black shadow-md">
            {/* Bold */}
            <button
              onClick={toggleBold}
              className={`p-2 rounded-md transition ${editor?.isActive("bold")
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <FiBold size={16} />
            </button>

            {/* Italic */}
            <button
              onClick={toggleItalic}
              className={`p-2 rounded-md transition ${editor?.isActive("italic")
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <FiItalic size={16} />
            </button>

            <div className="w-px h-5 bg-gray-600 mx-1" />

            {/* H1 */}
            <button
              onClick={toggleHeading}
              className={`p-2 rounded-md transition ${editor?.isActive("heading", { level: 1 })
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <LuHeading1 size={16} />
            </button>

            {/* Quote */}
            <button
              onClick={toggleBlockquote}
              className={`p-2 rounded-md transition ${editor?.isActive("blockquote")
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <RiDoubleQuotesL size={16} />
            </button>

            <div className="w-px h-5 bg-gray-600 mx-1" />

            {/* Link */}
            <button
              onClick={setLink}
              className={`p-2 rounded-md transition ${editor?.isActive("link")
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
                }`}
            >
              <FiLink size={16} />
            </button>

            {/* Image */}
            <button
              onClick={() => editorImageInputRef.current?.click()}
              className="p-2 rounded-md text-gray-300 hover:text-white transition"
            >
              <FiImage size={16} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} className="mt-6 tiptap" />
      </div>

      {/* Publish */}
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="fixed bottom-5 right-5 bg-black text-white px-4 py-2"
      >
        {isPublishing ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}
