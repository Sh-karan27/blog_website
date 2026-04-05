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
  Home,
  Compass,
  Bell,
  User,
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
  published: boolean; // ← add thi
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
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [userId] = useState("6673e9def8cc332b93206916");
  const [showComments, setShowComments] = useState(false);
  const commentsListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!blogId) return;

    socket.emit("join-blog", blogId);

    const handleBlogLiked = (data: {
      blogId: string;
      likeCount: number;
      isLiked?: boolean;
      title?: string;
    }) => {
      console.log("🔥 blog-liked received:", data);

      if (data.blogId === blogId) {
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                likeCount: data.likeCount,
              }
            : null,
        );
      }
    };

    socket.on("blog-liked", handleBlogLiked);

    return () => {
      socket.off("blog-liked", handleBlogLiked);
    };
  }, [blogId]);
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blog/${blogId}`);
        setBlog(response.data.data);
        setPublished(response.data.data?.published ?? true); // ← add this line
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
    if (blogId) {
      fetchBlog();
      fetchComments();
    }
  }, [blogId]);

  // Scroll comments list to bottom on new comment
  useEffect(() => {
    if (commentsListRef.current) {
      commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
    }
  }, [comments]);

  const handleDeleteBlog = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this blog? This cannot be undone.",
      )
    )
      return;
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

      setBlog((prev) =>
        prev
          ? {
              ...prev,
              likeCount: data.likeCount,
              isLiked: data.isLiked,
            }
          : null,
      );

      socket.emit("like-blog", {
        blogId,
        likeCount: data.likeCount,
        isLiked: data.isLiked,
        title: data.title,
      });

      console.log("✅ like-blog emitted");
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
            ? {
                ...c,
                isLiked: !c.isLiked,
                likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
              }
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
      const response = await axiosInstance.post(`/comments/${blogId}`, {
        content: newComment,
      });
      const newCommentData: Comment = {
        _id: response.data.data._id,
        user: {
          _id: userId,
          username: "faizal07",
          profileImage: {
            url: "http://res.cloudinary.com/karanshukla/image/upload/v1747733895/iqthluuhimomf15spe9w.jpg",
          },
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
      await axiosInstance.put(`/comments/c/${editingComment.id}`, {
        content: editingComment.content,
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === editingComment.id
            ? { ...c, content: editingComment.content }
            : c,
        ),
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
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const formatLikes = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        Loading...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-500">
        Blog not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 font-sans text-gray-900">
      <main className="max-w-4xl mx-auto">
        {/* Action Bar — replaces floating header */}
        <div className="mt-5  flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>

            {userId === blog?.author?._id && (
              <>
                <button
                  onClick={() => router.push(`/blog/edit/${blogId}`)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit blog"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
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
                  {published ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Private
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeleteBlog}
                  disabled={deleteLoading}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete blog"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
        {/* Hero Image */}
        <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-200">
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-5 py-6 md:px-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide mb-3">
              Blog
            </span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden"
                onClick={() => router.push(`/profile/${blog.author._id}`)}
              >
                <img
                  src={blog.author.profileImage.url}
                  alt={blog.author.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {blog.author.username}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(blog.createdAt)} • 6 min read
                </p>
              </div>
            </div>
          </div>

          <article className="prose prose-lg max-w-none text-gray-600 leading-relaxed mb-8">
            <div
              dangerouslySetInnerHTML={{
                __html: blog.content.replace(/\r\n/g, "<br>"),
              }}
            />
          </article>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <button
                onClick={toggleBlogLike}
                className="flex items-center gap-2 group"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${blog.isLiked ? "text-red-500 fill-red-500" : "text-gray-400 group-hover:text-red-500"}`}
                />
                <span className="text-sm font-medium text-gray-600">
                  {formatLikes(blog.likeCount)} Likes
                </span>
              </button>
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="flex items-center gap-2 group"
              >
                <MessageSquare
                  className={`w-5 h-5 transition-colors ${showComments ? "text-blue-500 fill-blue-100" : "text-gray-400 group-hover:text-blue-500"}`}
                />
                <span className="text-sm font-medium text-gray-600">
                  {blog.commentCount} Comments
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-5 py-8 md:px-8 border-t border-gray-100 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {blog.commentCount} Comments
              </h3>

              {/* Add New Comment Form */}
              <form
                onSubmit={addComment}
                className="mb-6 p-4 bg-white rounded-xl shadow-sm border"
              >
                <div className="flex gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
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
                    className="flex-1 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </button>
              </form>

              {/* ✅ Scrollable Comments List */}
              {loadingComments ? (
                <p className="text-gray-500 text-center py-8">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div
                  ref={commentsListRef}
                  className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      editing={editingComment?.id === comment._id}
                      editContent={
                        editingComment?.id === comment._id
                          ? editingComment.content
                          : comment.content
                      }
                      onEditContentChange={(content) =>
                        setEditingComment({ id: comment._id, content })
                      }
                      onEdit={() =>
                        setEditingComment({
                          id: comment._id,
                          content: comment.content,
                        })
                      }
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
      </main>
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
  comment,
  editing,
  editContent,
  onEditContentChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onLike,
  currentUserId,
}: CommentItemProps) => {
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const formatLikes = (count: number) =>
    count > 1000 ? (count / 1000).toFixed(1) + "k" : count.toString();

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border flex gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
        <img
          src={comment.user.profileImage.url}
          alt={comment.user.username}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <>
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-1 text-gray-600 text-sm rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.user.username}
              </span>
              {currentUserId === comment.user._id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    {" "}
                    {/* ✅ Fixed: was missing onClick */}
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-900 leading-relaxed mb-3">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{formatTime(comment.createdAt)}</span>
              <button
                onClick={onLike}
                className="flex items-center gap-1 hover:text-gray-900 group"
              >
                <Heart
                  className={`w-4 h-4 ${comment.isLiked ? "text-red-500 fill-red-500" : "text-gray-500 group-hover:text-red-500"}`}
                />
                <span>{formatLikes(comment.likeCount)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const NavIcon = ({ Icon, label, active }: any) => (
  <button
    className={`flex flex-col items-center gap-1 ${active ? "text-blue-700" : "text-gray-400 hover:text-gray-600"}`}
  >
    <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default SingleBlogPage;
