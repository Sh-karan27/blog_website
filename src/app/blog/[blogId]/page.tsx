"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, Share2, Bookmark, Heart, MessageSquare, Send, Edit2, Trash2, Pencil, Eye, EyeOff, ChevronDown } from "lucide-react";

const ACCENT = "#995F2F";
const ACCENT2 = "#7A4A22";
const BORDER = "#E4E8EE";

interface Author {
  _id: string;
  username: string;
  profileImage: { url: string };
  coverImage?: { url: string };
  followerCount: number;
  isFollowing: boolean;
  bio?: string;
  followingCount?: number;
  articleCount?: number;
}

interface MiniPost {
  _id: string;
  title: string;
  coverImage?: { url: string };
  createdAt: string;
}

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: { url: string };
  author: Author;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  views: number;
  commentCount: number;
  published: boolean;
  tag?: string[];
  moreFromAuthor?: MiniPost[];
}

interface Comment {
  _id: string;
  user: { _id: string; username: string; profileImage: { url: string } };
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

/* ── tiny Avatar helper ── */
function Avatar({ src, alt, size = 36 }: { src?: string; alt: string; size?: number }) {
  const initials = alt.slice(0, 2).toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${ACCENT2},#5A3820)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 800, fontSize: size * 0.33,
    }}>
      {initials}
    </div>
  );
}

const SingleBlogPage = () => {
  const { blogId } = useParams() as { blogId: string };
  const [published, setPublished] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [userId] = useState("6673e9def8cc332b93206916");
  const [currentUser, setCurrentUser] = useState<{ _id?: string; username?: string; profileImage?: { url: string } } | null>(null);
  const [showComments, setShowComments] = useState(true);
  const [visibleComments, setVisibleComments] = useState(5);
  const [isFollowing, setIsFollowing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    Promise.all([
      axiosInstance.get(`/blog/${blogId}`),
      axiosInstance.get(`/comments/${blogId}`),
      axiosInstance.get("/users/current-user").catch(() => null),
    ]).then(([blogRes, commentsRes, userRes]) => {
      setBlog(blogRes.data.data);
      setPublished(blogRes.data.data?.published ?? true);
      setIsFollowing(blogRes.data.data?.author?.isFollowing ?? false);
      setComments(commentsRes.data.data);
      if (userRes) setCurrentUser(userRes.data.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [blogId]);

  const handleDeleteBlog = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try { setDeleteLoading(true); await axiosInstance.delete(`/blog/${blogId}`); router.push("/"); }
    catch (err) { console.error(err); } finally { setDeleteLoading(false); }
  };

  const handleToggleStatus = async () => {
    try { setToggleLoading(true); await axiosInstance.patch(`/blog/toggle/status/${blogId}`); setPublished(p => !p); }
    catch (err) { console.error(err); } finally { setToggleLoading(false); }
  };

  const toggleBlogLike = async () => {
    try {
      const res = await axiosInstance.post(`/likes/toggle/v/${blogId}`);
      const d = res.data;
      setBlog(prev => prev ? { ...prev, likeCount: d.likeCount, isLiked: d.isLiked } : null);
    } catch (err) { console.error(err); }
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      await axiosInstance.post(`/likes/toggle/c/${commentId}`);
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 } : c));
    } catch (err) { console.error(err); }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axiosInstance.post(`/comments/${blogId}`, { content: newComment });
      const nc: Comment = {
        _id: res.data.data._id, content: newComment,
        user: { _id: userId, username: "faizal07", profileImage: { url: "http://res.cloudinary.com/karanshukla/image/upload/v1747733895/iqthluuhimomf15spe9w.jpg" } },
        createdAt: new Date().toISOString(), likeCount: 0, isLiked: false,
      };
      setComments(prev => [...prev, nc]);
      setNewComment("");
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount + 1 });
    } catch (err) { console.error(err); }
  };

  const editComment = async () => {
    if (!editingComment) return;
    try {
      await axiosInstance.put(`/comments/c/${editingComment.id}`, { content: editingComment.content });
      setComments(prev => prev.map(c => c._id === editingComment.id ? { ...c, content: editingComment.content } : c));
      setEditingComment(null);
    } catch (err) { console.error(err); }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount - 1 });
    } catch (err) { console.error(err); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const fmtN = (n: number) => n > 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!blog) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
      Blog not found
    </div>
  );

  const isOwner = userId === blog.author._id;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: "#171C20" }}>
      <style>{`
        .iw-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; font-family: inherit; cursor: pointer;
          transition: all 0.15s; line-height: 1; white-space: nowrap; outline: none;
        }
        .iw-btn-sm { padding: 5px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; }
        .iw-btn-primary { background: #995F2F; color: white; border: none; }
        .iw-btn-primary:hover:not(:disabled) { background: #7A4A22; }
        .iw-btn-primary:disabled { background: #CCCCCC; cursor: not-allowed; }
        .iw-btn-secondary { background: transparent; color: #995F2F; border: 1.5px solid #995F2F; }
        .iw-btn-secondary:hover { background: #995F2F; color: white; }
        .iw-btn-ghost { background: transparent; color: #666666; border: 1.5px solid #E5E5E5; }
        .iw-btn-ghost:hover { background: #F5F5F5; color: #1A1A1A; border-color: #CCCCCC; }

        /* ── Responsive layout ── */
        .iw-hero { width: 100%; aspect-ratio: 21/9; background: #F5F0EB; overflow: hidden; position: relative; }
        .iw-article-pad { max-width: 680px; margin: 0 auto; padding: 56px 24px 0; }
        .iw-nav-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 8px; }
        .iw-subtitle { font-size: 20px; line-height: 1.6; color: #6B7280; font-weight: 400; margin-bottom: 28px; }
        .iw-engbar { display: flex; align-items: center; justify-content: space-between; padding: 20px 0; margin-bottom: 48px; }
        .iw-engbar-group { display: flex; align-items: center; gap: 4px; }
        .iw-more-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .iw-card-body { padding: 0 28px 28px; }

        @media (max-width: 640px) {
          .iw-hero { aspect-ratio: 16/9; }
          .iw-article-pad { padding: 28px 16px 0; }
          .iw-nav-row { flex-wrap: wrap; }
          .iw-subtitle { font-size: 16px; }
          .iw-engbar { flex-wrap: wrap; gap: 8px; }
          .iw-more-grid { grid-template-columns: 1fr; }
          .iw-card-body { padding: 0 16px 20px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .iw-article-pad { padding: 40px 20px 0; }
          .iw-more-grid { grid-template-columns: repeat(2,1fr); }
          .iw-hero { aspect-ratio: 16/9; }
        }
      `}</style>


      {/* ── Hero cover ── */}
      <div className="iw-hero">
        <img src={blog.coverImage?.url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* ── Article wrap ── */}
      <article>
        <div className="iw-article-pad">

          {/* Nav row: Back | owner controls | Share + Bookmark */}
          <div className="iw-nav-row">
            <button
              onClick={() => router.back()}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#666666", cursor: "pointer", border: "none", background: "transparent", padding: "6px 0", transition: "color 0.15s", fontFamily: "inherit" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#1A1A1A"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#666666"; }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {isOwner && (
                <>
                  <IconBtn title="Edit" accent onClick={() => router.push(`/blog/edit/${blogId}`)}><Pencil size={16} /></IconBtn>
                  <IconBtn title={published ? "Set Private" : "Set Public"} onClick={handleToggleStatus} disabled={toggleLoading}>
                    {published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={handleDeleteBlog} disabled={deleteLoading}><Trash2 size={16} /></IconBtn>
                  <div style={{ width: 1, height: 20, background: "#E5E5E5", margin: "0 4px" }} />
                </>
              )}
              <IconBtn title="Share"><Share2 size={16} /></IconBtn>
              <IconBtn title="Bookmark" active={saved} onClick={() => setSaved(s => !s)}><Bookmark size={16} style={saved ? { fill: ACCENT, color: ACCENT } : {}} /></IconBtn>
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: `rgba(153,95,47,0.12)`, color: ACCENT, border: `1px solid rgba(153,95,47,0.2)` }}>
              {blog.tag?.[0] ?? "Blog"}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#171C20", marginBottom: 16 }}>
            {blog.title}
          </h1>

          {/* Subtitle */}
          <p className="iw-subtitle">
            {blog.description}
          </p>

          {/* Author byline */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 24, borderBottom: `1px solid ${BORDER}`, flexWrap: "wrap" as const, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <button onClick={() => router.push(`/profile/${blog.author._id}`)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                <Avatar src={blog.author.profileImage?.url} alt={blog.author.username} size={44} />
              </button>
              <div>
                <button onClick={() => router.push(`/profile/${blog.author._id}`)} style={{ fontSize: 14, fontWeight: 700, color: "#171C20", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  {blog.author.username}
                </button>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 1 }}>{fmt(blog.createdAt)} · 6 min read</div>
              </div>
            </div>
            <button
              className="iw-btn iw-btn-sm"
              onClick={() => setIsFollowing(f => !f)}
              style={{ marginLeft: 4, borderRadius: 9999, border: `1.5px solid ${ACCENT}`, color: isFollowing ? "white" : ACCENT, background: isFollowing ? ACCENT : "transparent", fontWeight: 700 }}
            >
              {isFollowing ? "Following" : "+ Follow"}
            </button>
          </div>

          {/* Prose */}
          <div style={{ padding: "40px 0" }}>
            <div
              className="prose prose-neutral lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-7 prose-p:my-4 prose-a:text-[#985F2E] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-[#985F2E] prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:bg-[#FBF7F4] prose-blockquote:py-1 prose-img:rounded-xl prose-code:text-[#985F2E] prose-code:bg-[#FBF7F4] prose-code:px-1 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* ── Engagement bar ── */}
          <div className="iw-engbar" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
            <div className="iw-engbar-group">
              <EngBtn active={blog.isLiked} onClick={toggleBlogLike} aria-label="Like">
                <Heart size={16} style={blog.isLiked ? { fill: "currentColor" } : {}} />
                {fmtN(blog.likeCount)}
              </EngBtn>
              <EngBtn onClick={() => { setShowComments(s => !s); document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="Comments">
                <MessageSquare size={16} />
                {blog.commentCount}
              </EngBtn>
            </div>
            <div className="iw-engbar-group">
              <EngBtn active={saved} bookmarked={saved} onClick={() => setSaved(s => !s)} aria-label="Save">
                <Bookmark size={16} style={saved ? { fill: "currentColor" } : {}} />
                {saved ? "Saved" : "Save"}
              </EngBtn>
              <EngBtn aria-label="Share">
                <Share2 size={16} />
                Share
              </EngBtn>
            </div>
          </div>

          {/* ── Author card ── */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden", marginBottom: 64, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {/* Cover strip — author's cover image or fallback gradient */}
            <div style={{ height: 80, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, position: "relative", overflow: "hidden" }}>
              {blog.author.coverImage?.url && (
                <img src={blog.author.coverImage.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
            </div>
            <div className="iw-card-body">
              {/* Avatar row — overlaps cover, z-index keeps it above the cover strip */}
              <div style={{ marginTop: -28, marginBottom: 16, position: "relative", zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid white", overflow: "hidden", flexShrink: 0, boxSizing: "content-box" as const }}>
                  <img src={blog.author.profileImage?.url} alt={blog.author.username} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </div>
              {/* Name row + Follow button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em" }}>{blog.author.username}</div>
                <button
                  className="iw-btn iw-btn-sm"
                  onClick={() => setIsFollowing(f => !f)}
                  style={{ flexShrink: 0, border: `1.5px solid ${ACCENT}`, color: isFollowing ? "white" : ACCENT, background: isFollowing ? ACCENT : "transparent" }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
              {blog.author.bio && (
                <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 16 }}>{blog.author.bio}</div>
              )}
              <div style={{ display: "flex", gap: 24, marginBottom: 20, marginTop: blog.author.bio ? 0 : 12 }}>
                <div>
                  <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: ACCENT, display: "block" }}>{fmtN(blog.author.followerCount ?? 0)}</span>
                  <span style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#6B7280", fontWeight: 700 }}>Followers</span>
                </div>
                {blog.author.articleCount != null && (
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: ACCENT, display: "block" }}>{blog.author.articleCount}</span>
                    <span style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#6B7280", fontWeight: 700 }}>Articles</span>
                  </div>
                )}
                {blog.author.followingCount != null && (
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em", color: ACCENT, display: "block" }}>{fmtN(blog.author.followingCount)}</span>
                    <span style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#6B7280", fontWeight: 700 }}>Following</span>
                  </div>
                )}
              </div>
              <button
                className="iw-btn iw-btn-ghost iw-btn-sm"
                onClick={() => router.push(`/profile/${blog.author._id}`)}
              >
                View Profile →
              </button>
            </div>
          </div>

          {/* ── More from author ── */}
          {blog.moreFromAuthor && blog.moreFromAuthor.length > 0 && (
            <div style={{ marginBottom: 64 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.015em", marginBottom: 20, color: ACCENT }}>
                More from {blog.author.username}
              </h3>
              <div className="iw-more-grid">
                {blog.moreFromAuthor.map(post => (
                  <button
                    key={post._id}
                    onClick={() => router.push(`/blog/${post._id}`)}
                    style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "#fff", textAlign: "left", padding: 0, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ aspectRatio: "16/9", background: "#F5F0EB", overflow: "hidden" }}>
                      {post.coverImage?.url
                        ? <img src={post.coverImage.url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: `repeating-linear-gradient(-45deg,#EFEFEF 0,#EFEFEF 1.5px,#F8F9FA 1.5px,#F8F9FA 14px)` }} />
                      }
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.35, color: "#171C20", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Comments ── */}
          <div id="comments" style={{ paddingBottom: 80 }}>
            <div
              onClick={() => setShowComments(s => !s)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", cursor: "pointer", borderTop: `1px solid ${BORDER}` }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: ACCENT }}>{blog.commentCount} Comments</h3>
              <ChevronDown size={16} color="#666666" style={{ transition: "transform 0.2s", transform: showComments ? "rotate(0deg)" : "rotate(-90deg)" }} />
            </div>

            {showComments && (
              <div>
                {/* Add comment */}
                <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 12, padding: "20px 0", borderBottom: `1px solid #E5E5E5`, alignItems: "start" }}>
                  <Avatar src={currentUser?.profileImage?.url} alt={currentUser?.username ?? "me"} size={36} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Write a thoughtful comment…"
                      rows={3}
                      style={{ width: "100%", minHeight: 100, padding: "10px 14px", border: `1.5px solid #E5E5E5`, borderRadius: 8, resize: "none", fontSize: 14, fontFamily: "inherit", outline: "none", transition: "all 0.15s", lineHeight: 1.5, color: "#1A1A1A", background: "white" }}
                      onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(153,95,47,0.12)`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={addComment as any}
                        className="iw-btn iw-btn-primary iw-btn-sm"
                        disabled={!newComment.trim()}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comment list */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {loadingComments ? (
                    <p style={{ color: "#666666", textAlign: "center", padding: "32px 0" }}>Loading comments…</p>
                  ) : comments.length === 0 ? (
                    <p style={{ color: "#666666", textAlign: "center", padding: "48px 0" }}>No comments yet. Be the first!</p>
                  ) : (
                    <>
                      {comments.slice(0, visibleComments).map(comment => (
                        <CommentItem
                          key={comment._id}
                          comment={comment}
                          editing={editingComment?.id === comment._id}
                          editContent={editingComment?.id === comment._id ? editingComment.content : comment.content}
                          onEditContentChange={content => setEditingComment({ id: comment._id, content })}
                          onEdit={() => setEditingComment({ id: comment._id, content: comment.content })}
                          onSave={editComment}
                          onCancel={() => setEditingComment(null)}
                          onDelete={() => deleteComment(comment._id)}
                          onLike={() => toggleCommentLike(comment._id)}
                          currentUserId={userId}
                        />
                      ))}
                      {visibleComments < comments.length && (
                        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                          <button
                            onClick={() => setVisibleComments(v => v + 10)}
                            className="iw-btn iw-btn-ghost"
                            style={{ borderRadius: 9999, fontSize: 13 }}
                          >
                            Load more comments ({comments.length - visibleComments})
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </article>
    </div>
  );
};

/* ── Icon button ── */
function IconBtn({ children, title, onClick, disabled, active, accent, danger }: {
  children: React.ReactNode; title?: string; onClick?: () => void;
  disabled?: boolean; active?: boolean; accent?: boolean; danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: 8,
        border: `1.5px solid ${danger ? "rgba(239,68,68,0.3)" : accent ? "rgba(153,95,47,0.3)" : "#E5E5E5"}`,
        background: "#fff", cursor: disabled ? "not-allowed" : "pointer",
        color: danger ? "#EF4444" : accent ? ACCENT : "#666666",
        transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = danger ? "#FEF2F2" : accent ? "rgba(153,95,47,0.08)" : "#F5F5F5"; e.currentTarget.style.borderColor = danger ? "rgba(239,68,68,0.5)" : accent ? "rgba(153,95,47,0.5)" : "#CCCCCC"; e.currentTarget.style.color = danger ? "#EF4444" : accent ? ACCENT : "#000"; } }}
      onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = danger ? "rgba(239,68,68,0.3)" : accent ? "rgba(153,95,47,0.3)" : "#E5E5E5"; e.currentTarget.style.color = danger ? "#EF4444" : accent ? ACCENT : "#666666"; }}
    >
      {children}
    </button>
  );
}

/* ── Engagement pill button ── */
function EngBtn({ children, onClick, active, bookmarked, ...rest }: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; bookmarked?: boolean; [k: string]: any;
}) {
  const isBookmarked = bookmarked && active;
  const activeColor = isBookmarked ? ACCENT2 : ACCENT;
  const activeBg = isBookmarked ? "rgba(122,74,34,0.10)" : "rgba(153,95,47,0.10)";
  const activeBorder = isBookmarked ? "rgba(122,74,34,0.30)" : "rgba(153,95,47,0.30)";
  return (
    <button
      onClick={onClick}
      {...rest}
      style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
        borderRadius: 9999, border: `1.5px solid ${active ? activeBorder : "#E5E5E5"}`,
        background: active ? activeBg : "transparent",
        color: active ? activeColor : "#666666", fontSize: 13, fontWeight: 600,
        cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#F5F5F5"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}

/* ── Comment item ── */
interface CommentItemProps {
  comment: Comment; editing: boolean; editContent: string;
  onEditContentChange: (c: string) => void; onEdit: () => void;
  onSave: () => void; onCancel: () => void; onDelete: () => void;
  onLike: () => void; currentUserId: string;
}

const CommentItem = ({ comment, editing, editContent, onEditContentChange, onEdit, onSave, onCancel, onDelete, onLike, currentUserId }: CommentItemProps) => {
  const fmtT = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const fmtN = (n: number) => n > 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <div style={{ padding: "20px 0", borderBottom: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "36px 1fr", gap: 12 }}>
      <Avatar src={comment.user.profileImage?.url} alt={comment.user.username} size={36} />
      <div>
        {editing ? (
          <>
            <textarea
              value={editContent}
              onChange={e => onEditContentChange(e.target.value)}
              style={{ width: "100%", minHeight: 100, padding: "10px 14px", border: "1.5px solid #E5E5E5", borderRadius: 8, resize: "none", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 8, color: "#1A1A1A", background: "white", transition: "all 0.15s" }}
              rows={3}
              onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(153,95,47,0.12)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onSave} className="iw-btn iw-btn-primary iw-btn-sm">Save</button>
              <button onClick={onCancel} className="iw-btn iw-btn-ghost iw-btn-sm">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{comment.user.username}</span>
              <span style={{ fontSize: 11, color: "#666666" }}>{fmtT(comment.createdAt)}</span>
              {currentUserId === comment.user._id && (
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button onClick={onEdit} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, color: "#666666" }}><Edit2 size={13} /></button>
                  <button onClick={onDelete} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", borderRadius: 6, color: "#F87171" }}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "#1A1A1A", margin: "6px 0 10px" }}>{comment.content}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={onLike}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: comment.isLiked ? ACCENT : "#666666", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", transition: "color 0.15s" }}
              >
                <Heart size={13} style={comment.isLiked ? { fill: "currentColor" } : {}} />
                {fmtN(comment.likeCount)}
              </button>
              <button style={{ fontSize: 12, color: "#666666", background: "transparent", border: "none", cursor: "pointer", padding: "2px 0" }}>Reply</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SingleBlogPage;
