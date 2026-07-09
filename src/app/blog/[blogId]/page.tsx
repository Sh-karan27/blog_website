"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import LoadingScreen from "@/components/LoadingScreen";
import {
  ArrowLeft, Share2, Bookmark, Heart, MessageSquare,
  Edit2, Trash2, Pencil, Eye, EyeOff,
} from "lucide-react";

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
function Avatar({ src, alt, className = "w-8 h-8", textClass = "text-[11px]" }: { src?: string; alt: string; className?: string; textClass?: string }) {
  return (
    <span className={`${className} rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-300 overflow-hidden shrink-0 ${textClass}`}>
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : alt.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ── icon action button (top bar) ── */
function IconBtn({ children, label, onClick, disabled, danger }: {
  children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 ${
        danger
          ? "text-red-600/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      }`}
    >
      {children}
    </button>
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
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [userId] = useState("6673e9def8cc332b93206916");
  const [currentUser, setCurrentUser] = useState<{ _id?: string; username?: string; profileImage?: { url: string } } | null>(null);
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
        user: {
          _id: currentUser?._id ?? userId,
          username: currentUser?.username ?? "you",
          profileImage: { url: currentUser?.profileImage?.url ?? "" },
        },
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
  const readTime = blog ? Math.max(1, Math.ceil((blog.content || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length / 200)) : 1;

  if (loading) return <LoadingScreen status="Fetching story…" />;

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm">
      Blog not found
    </div>
  );

  const isOwner = (currentUser?._id ?? userId) === blog.author._id;

  return (
    <div className="min-h-screen">
      {/* ══ ACTION BAR ══ */}
      <div className="sticky top-16 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-1.5">
            {isOwner && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-green-600/80" : "bg-zinc-400"}`} />
                  {published ? "Public" : "Private"}
                </span>
                <IconBtn label="Edit story" onClick={() => router.push(`/blog/edit/${blogId}`)}>
                  <Pencil size={14} />
                </IconBtn>
                <IconBtn label={published ? "Set private" : "Set public"} onClick={handleToggleStatus} disabled={toggleLoading}>
                  {published ? <Eye size={14} /> : <EyeOff size={14} />}
                </IconBtn>
                <IconBtn label="Delete story" danger onClick={handleDeleteBlog} disabled={deleteLoading}>
                  <Trash2 size={14} />
                </IconBtn>
                <span className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
              </>
            )}
            <IconBtn label="Bookmark" onClick={() => setSaved(s => !s)}>
              <Bookmark size={14} className={saved ? "fill-current" : ""} />
            </IconBtn>
            <IconBtn label="Share">
              <Share2 size={14} />
            </IconBtn>
          </div>
        </div>
      </div>

      <main>
        {/* ══ COVER ══ */}
        {blog.coverImage?.url ? (
          <div className="w-full aspect-[21/9] max-h-[420px] overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
            <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="img-ph w-full aspect-[21/9] max-h-[420px] flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-mono text-[10px] text-zinc-400">cover</span>
          </div>
        )}

        {/* ══ ARTICLE ══ */}
        <article className="max-w-2xl mx-auto px-6 pt-12 pb-8">
          {blog.tag?.[0] && (
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4">{blog.tag[0]}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">{blog.title}</h1>
          {blog.description && (
            <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">{blog.description}</p>
          )}

          {/* Byline */}
          <div className="flex items-center gap-3 pb-8 border-b border-zinc-200 dark:border-zinc-800">
            <button onClick={() => router.push(`/profile/${blog.author._id}`)}>
              <Avatar src={blog.author.profileImage?.url} alt={blog.author.username} className="w-10 h-10" textClass="text-xs" />
            </button>
            <div className="text-sm">
              <div className="flex items-center gap-2.5">
                <Link href={`/profile/${blog.author._id}`} className="font-semibold hover:underline underline-offset-4">
                  {blog.author.username}
                </Link>
                {!isOwner && (
                  <button
                    onClick={() => setIsFollowing(f => !f)}
                    className={
                      isFollowing
                        ? "h-6 px-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium"
                        : "h-6 px-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    }
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
              <p className="text-zinc-400 text-xs mt-0.5">{fmt(blog.createdAt)} · {readTime} min read</p>
            </div>
          </div>

          {/* ══ PROSE ══ */}
          <div className="inkwell-prose pt-10" dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* ══ ENGAGEMENT BAR ══ */}
          <div className="flex items-center gap-1 mt-12 py-4 border-y border-zinc-200 dark:border-zinc-800">
            <button
              onClick={toggleBlogLike}
              className={`h-9 px-3.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
                blog.isLiked
                  ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
              aria-label="Like"
            >
              <Heart size={15} className={blog.isLiked ? "fill-current" : ""} />
              {fmtN(blog.likeCount)}
            </button>
            <button
              onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
              className="h-9 px-3.5 rounded-md flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Comments"
            >
              <MessageSquare size={15} />
              {blog.commentCount}
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setSaved(s => !s)}
                className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Bookmark"
              >
                <Bookmark size={15} className={saved ? "fill-current" : ""} />
              </button>
              <button
                className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Share"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          {/* ══ AUTHOR CARD ══ */}
          <div className="mt-12 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row gap-5 sm:items-center">
            <Avatar src={blog.author.profileImage?.url} alt={blog.author.username} className="w-14 h-14" textClass="text-base" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold tracking-[-0.01em]">{blog.author.username}</h3>
              {blog.author.bio && (
                <p className="text-sm text-zinc-500 leading-relaxed mt-1">{blog.author.bio}</p>
              )}
              <p className="text-xs text-zinc-400 mt-2">
                {fmtN(blog.author.followerCount ?? 0)} followers
                {blog.author.articleCount != null ? ` · ${blog.author.articleCount} stories` : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!isOwner && (
                <button
                  onClick={() => setIsFollowing(f => !f)}
                  className="h-9 px-4 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
              <Link
                href={`/profile/${blog.author._id}`}
                className="h-9 px-4 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium inline-flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* ══ MORE FROM AUTHOR ══ */}
          {blog.moreFromAuthor && blog.moreFromAuthor.length > 0 && (
            <section className="mt-14">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-6">
                More from {blog.author.username}
              </h2>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {blog.moreFromAuthor.map((post) => (
                  <Link key={post._id} href={`/blog/${post._id}`} className="group flex gap-5 py-5 first:pt-0">
                    {post.coverImage?.url ? (
                      <div className="w-24 h-16 rounded-md overflow-hidden shrink-0">
                        <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="img-ph w-24 h-16 rounded-md shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-snug mb-1 group-hover:underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ══ COMMENTS ══ */}
          <section id="comments" className="mt-14 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold tracking-[-0.01em] mb-6">
              Comments <span className="text-zinc-400 font-normal">{blog.commentCount}</span>
            </h2>

            {/* Add comment */}
            <div className="flex gap-3 mb-10">
              <Avatar src={currentUser?.profileImage?.url} alt={currentUser?.username ?? "me"} />
              <div className="flex-1">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment…"
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent resize-none transition-shadow"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={addComment as any}
                    disabled={!newComment.trim()}
                    className="h-8 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comment list */}
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No comments yet. Be the first!</p>
            ) : (
              <div className="space-y-8">
                {comments.slice(0, visibleComments).map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    editing={editingComment?.id === comment._id}
                    editContent={editingComment?.id === comment._id ? editingComment.content : comment.content}
                    onEditContentChange={(content) => setEditingComment({ id: comment._id, content })}
                    onEdit={() => setEditingComment({ id: comment._id, content: comment.content })}
                    onSave={editComment}
                    onCancel={() => setEditingComment(null)}
                    onDelete={() => deleteComment(comment._id)}
                    onLike={() => toggleCommentLike(comment._id)}
                    currentUserId={currentUser?._id ?? userId}
                  />
                ))}
              </div>
            )}

            {visibleComments < comments.length && (
              <button
                onClick={() => setVisibleComments((v) => v + 10)}
                className="mt-8 h-9 px-4 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-full sm:w-auto"
              >
                Load more comments ({comments.length - visibleComments})
              </button>
            )}
          </section>
        </article>
      </main>
    </div>
  );
};

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
    <div className="flex gap-3">
      <Avatar src={comment.user.profileImage?.url} alt={comment.user.username} />
      <div className="min-w-0 flex-1">
        {editing ? (
          <>
            <textarea
              rows={3}
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent resize-none transition-shadow mb-2"
            />
            <div className="flex gap-2">
              <button onClick={onSave} className="h-8 px-3.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors">
                Save
              </button>
              <button onClick={onCancel} className="h-8 px-3.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm flex items-center gap-2">
              <span className="font-semibold">{comment.user.username}</span>
              <span className="text-zinc-400 text-xs">· {fmtT(comment.createdAt)}</span>
              {currentUserId === comment.user._id && (
                <span className="ml-auto flex gap-1">
                  <button onClick={onEdit} className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" aria-label="Edit comment">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={onDelete} className="p-1 rounded text-zinc-400 hover:text-red-600 transition-colors" aria-label="Delete comment">
                    <Trash2 size={13} />
                  </button>
                </span>
              )}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mt-1.5">{comment.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <button
                onClick={onLike}
                className={`flex items-center gap-1 transition-colors ${
                  comment.isLiked ? "text-zinc-900 dark:text-zinc-100" : "hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Heart size={12} className={comment.isLiked ? "fill-current" : ""} /> {fmtN(comment.likeCount)}
              </button>
              <button className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Reply</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SingleBlogPage;
