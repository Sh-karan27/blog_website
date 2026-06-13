"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: { url: string };
  author: { username: string; profileImage: { url: string }; _id: string };
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  views: number;
  commentCount: number;
  published: boolean;
}

interface Comment {
  _id: string;
  user: { _id: string; username: string; profileImage: { url: string } };
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

const SingleBlogPage = () => {
  const socket = io("http://localhost:3000");
  const { blogId } = useParams() as { blogId: string };
  const [published, setPublished] = useState<boolean>(true);
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
  const [showComments, setShowComments] = useState(false);
  const commentsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!blogId) return;
    socket.emit("join-blog", blogId);
    const handleBlogLiked = (data: { blogId: string; likeCount: number; isLiked?: boolean; title?: string }) => {
      if (data.blogId === blogId) {
        setBlog((prev) => prev ? { ...prev, likeCount: data.likeCount } : null);
      }
    };
    socket.on("blog-liked", handleBlogLiked);
    return () => { socket.off("blog-liked", handleBlogLiked); };
  }, [blogId]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blog/${blogId}`);
        setBlog(response.data.data);
        setPublished(response.data.data?.published ?? true);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const response = await axiosInstance.get(`/comments/${blogId}`);
        setComments(response.data.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    if (blogId) { fetchBlog(); fetchComments(); }
  }, [blogId]);

  useEffect(() => {
    if (commentsListRef.current) {
      commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
    }
  }, [comments]);

  const handleDeleteBlog = async () => {
    if (!confirm("Are you sure you want to delete this blog? This cannot be undone.")) return;
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/blog/${blogId}`);
      router.push("/");
    } catch (err) {
      console.error("Failed to delete blog:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setToggleLoading(true);
      await axiosInstance.patch(`/blog/toggle/status/${blogId}`);
      setPublished((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setToggleLoading(false);
    }
  };

  const toggleBlogLike = async () => {
    try {
      const response = await axiosInstance.post(`/likes/toggle/v/${blogId}`);
      const data = response.data;
      setBlog((prev) => prev ? { ...prev, likeCount: data.likeCount, isLiked: data.isLiked } : null);
      socket.emit("like-blog", { blogId, likeCount: data.likeCount, isLiked: data.isLiked, title: data.title });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    try {
      await axiosInstance.post(`/likes/toggle/c/${commentId}`);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 }
            : c,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await axiosInstance.post(`/comments/${blogId}`, { content: newComment });
      const newCommentData: Comment = {
        _id: response.data.data._id,
        user: {
          _id: userId,
          username: "faizal07",
          profileImage: { url: "http://res.cloudinary.com/karanshukla/image/upload/v1747733895/iqthluuhimomf15spe9w.jpg" },
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
      };
      setComments((prev) => [...prev, newCommentData]);
      setNewComment("");
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount + 1 });
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const editComment = async () => {
    if (!editingComment) return;
    try {
      await axiosInstance.put(`/comments/c/${editingComment.id}`, { content: editingComment.content });
      setComments((prev) =>
        prev.map((c) => c._id === editingComment.id ? { ...c, content: editingComment.content } : c),
      );
      setEditingComment(null);
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount - 1 });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatLikes = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-3 border-[#985F2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        Blog not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* ── Action Bar ── */}
      <div className="max-w-4xl mx-auto px-5 pt-6 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#985F2E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#F5F0EB] rounded-full transition-colors" title="Share">
            <Share2 className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-[#F5F0EB] rounded-full transition-colors" title="Bookmark">
            <Bookmark className="w-4 h-4 text-gray-500" />
          </button>

          {userId === blog?.author?._id && (
            <>
              <button
                onClick={() => router.push(`/blog/edit/${blogId}`)}
                className="p-2 hover:bg-[#F5F0EB] rounded-full transition-colors"
                title="Edit blog"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={handleToggleStatus}
                disabled={toggleLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  published
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {published ? <><Eye className="w-3.5 h-3.5" /> Public</> : <><EyeOff className="w-3.5 h-3.5" /> Private</>}
              </button>

              <button
                onClick={handleDeleteBlog}
                disabled={deleteLoading}
                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Delete blog"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Cover Image ── */}
      <div className="w-full aspect-[21/9] overflow-hidden bg-[#F5F0EB]">
        <img
          src={blog.coverImage.url}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Reading Column ── */}
      <div className="max-w-[680px] mx-auto px-5 py-10">
        {/* Category badge */}
        <span className="inline-block px-3 py-1 bg-[#985F2E]/10 text-[#985F2E] text-[11px] font-black rounded-full uppercase tracking-widest mb-5">
          Blog
        </span>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 leading-tight mb-4">
          {blog.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-500 leading-relaxed mb-8">
          {blog.description}
        </p>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#E5E5E5]">
          <button
            className="w-10 h-10 rounded-full bg-[#E5E5E5] overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#985F2E] transition-all"
            onClick={() => router.push(`/profile/${blog.author._id}`)}
          >
            <img
              src={blog.author.profileImage.url}
              alt={blog.author.username}
              className="w-full h-full object-cover"
            />
          </button>
          <div>
            <button
              onClick={() => router.push(`/profile/${blog.author._id}`)}
              className="text-sm font-bold text-gray-900 hover:text-[#985F2E] transition-colors"
            >
              {blog.author.username}
            </button>
            <p className="text-xs text-gray-400">
              {formatDate(blog.createdAt)} · 6 min read
            </p>
          </div>
        </div>

        {/* Article body */}
        <article className="mb-12">
          <div
            className="
              prose prose-neutral lg:prose-lg max-w-none
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-7 prose-p:my-4
              prose-a:text-[#985F2E] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-blockquote:border-l-4 prose-blockquote:border-[#985F2E]
              prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:italic
              prose-blockquote:bg-[#FBF7F4] prose-blockquote:py-1 prose-blockquote:not-italic
              prose-img:rounded-xl prose-img:shadow-sm prose-img:my-6
              prose-ul:pl-5 prose-ol:pl-5
              prose-li:marker:text-[#985F2E]
              prose-code:text-[#985F2E] prose-code:bg-[#FBF7F4] prose-code:px-1 prose-code:rounded
            "
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* ── Engagement Bar ── */}
        <div className="flex items-center gap-6 py-5 border-t border-b border-[#E5E5E5] mb-10">
          <button
            onClick={toggleBlogLike}
            className="flex items-center gap-2 group transition-all"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                blog.isLiked ? "text-red-500 fill-red-500 scale-110" : "text-gray-400 group-hover:text-red-400"
              }`}
            />
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
              {formatLikes(blog.likeCount)} Likes
            </span>
          </button>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-2 group"
          >
            <MessageSquare
              className={`w-5 h-5 transition-colors ${
                showComments ? "text-[#985F2E] fill-[#985F2E]/10" : "text-gray-400 group-hover:text-[#985F2E]"
              }`}
            />
            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
              {blog.commentCount} Comments
            </span>
          </button>
        </div>

        {/* ── Author card ── */}
        <div className="rounded-2xl overflow-hidden border border-[#E5E5E5] mb-12">
          <div className="h-24 bg-gradient-to-r from-[#985F2E] to-[#7A4A22]" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                <img
                  src={blog.author.profileImage.url}
                  alt={blog.author.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pb-1">
                <h3 className="font-black text-gray-900">{blog.author.username}</h3>
              </div>
            </div>
            <button
              onClick={() => router.push(`/profile/${blog.author._id}`)}
              className="px-4 py-2 border border-[#985F2E] text-[#985F2E] text-sm font-bold rounded-lg hover:bg-[#985F2E] hover:text-white transition-all"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="max-w-[680px] mx-auto px-5 py-10">
            <h3 className="text-xl font-black text-gray-900 mb-6">
              {blog.commentCount} Comments
            </h3>

            {/* Add comment */}
            <form onSubmit={addComment} className="mb-8">
              <div className="flex gap-3 mb-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src="http://res.cloudinary.com/karanshukla/image/upload/v1747733895/iqthluuhimomf15spe9w.jpg"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-3 border border-[#E5E5E5] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#985F2E]/30 focus:border-[#985F2E] transition-all bg-white text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#985F2E] text-white text-sm font-bold rounded-lg hover:bg-[#7A4A22] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Comment
                </button>
              </div>
            </form>

            {/* Comments list */}
            {loadingComments ? (
              <p className="text-gray-400 text-center py-8">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No comments yet. Be the first!</p>
            ) : (
              <div
                ref={commentsListRef}
                className="space-y-4 max-h-[500px] overflow-y-auto pr-1"
              >
                {comments.map((comment) => (
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
                    currentUserId={userId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  editing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onLike: () => void;
  currentUserId: string;
}

const CommentItem = ({
  comment, editing, editContent, onEditContentChange,
  onEdit, onSave, onCancel, onDelete, onLike, currentUserId,
}: CommentItemProps) => {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const formatLikes = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex gap-3">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <img src={comment.user.profileImage.url} alt={comment.user.username} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <>
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full p-3 border border-[#E5E5E5] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#985F2E]/30 focus:border-[#985F2E] mb-2 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={onSave} className="px-4 py-1.5 bg-[#985F2E] text-white text-xs font-bold rounded-lg hover:bg-[#7A4A22] transition-colors">
                Save
              </button>
              <button onClick={onCancel} className="px-4 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 text-sm">{comment.user.username}</span>
              {currentUserId === comment.user._id && (
                <div className="flex items-center gap-1">
                  <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded-full">
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={onDelete} className="p-1 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{comment.content}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{formatTime(comment.createdAt)}</span>
              <button onClick={onLike} className="flex items-center gap-1 hover:text-[#985F2E] transition-colors group">
                <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? "text-red-500 fill-red-500" : "group-hover:text-red-400"}`} />
                <span>{formatLikes(comment.likeCount)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SingleBlogPage;
