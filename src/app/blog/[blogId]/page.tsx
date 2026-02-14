"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  Share,
  Home,
  Compass,
  Bell,
  User,
  Send,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";

// Blog interface (from your API)
interface BlogPost {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: { url: string };
  author: {
    username: string;
    profileImage: { url: string };
  };
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
}

// Comment interfaces
interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    profileImage: { url: string };
  };
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

const SingleBlogPage = () => {
  const { blogId } = useParams() as { blogId: string };
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
  const [userId] = useState("6673e9def8cc332b93206916"); // Replace with real user ID from auth
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blog/${blogId}`);
        setBlog(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch blog:", err);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchBlog();
  }, [blogId]);

  // Fetch comments
  useEffect(() => {
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

    if (blogId) fetchComments();
  }, [blogId]);

  // Scroll to bottom when new comments added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Toggle blog like
  const toggleBlogLike = async () => {
    try {
      await axiosInstance.post(`/likes/toggle/v/${blogId}`);
      setBlog((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
            }
          : null,
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Toggle comment like
  const toggleCommentLike = async (commentId: string) => {
    try {
      await axiosInstance.post(`/likes/toggle/c/${commentId}`);
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked
                  ? comment.likeCount - 1
                  : comment.likeCount + 1,
              }
            : comment,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
    }
  };

  // Add new comment
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
          username: "faizal07", // Replace with real user data
          profileImage: {
            url: "http://res.cloudinary.com/karanshukla/image/upload/v1747733895/iqthluuhimomf15spe9w.jpg",
          },
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
      };
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment("");
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount + 1 });
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Edit comment
  const editComment = async (e: React.FormEvent) => {
    if (!editingComment) return;

    try {
      await axiosInstance.put(`/comments/c/${editingComment.id}`, {
        content: editingComment.content,
      });
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === editingComment.id
            ? { ...comment, content: editingComment.content }
            : comment,
        ),
      );
      setEditingComment(null);
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (blog) setBlog({ ...blog, commentCount: blog.commentCount - 1 });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-gray-100 md:px-8 max-w-4xl mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-6 h-6 text-gray-800" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bookmark className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Hero Image */}
        <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-200">
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-5 py-6 md:px-8">
          {/* Blog Content */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide mb-3">
              Blog
            </span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
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
              <button className="flex items-center gap-2 group">
                <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-medium text-gray-600">
                  {blog.commentCount} Comments
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-5 py-8 md:px-8 border-t border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {blog.commentCount} Comments
            </h3>

            {/* Add New Comment Form */}
            <form
              onSubmit={addComment}
              className="mb-8 p-4 bg-white rounded-xl shadow-sm border"
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

            {/* Comments List */}
            {loadingComments ? (
              <p className="text-gray-500 text-center py-8">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    editing={editingComment?.id === comment._id}
                    onEditContentChange={(content) =>
                      setEditingComment({ id: comment._id, content })
                    }
                    onSave={() =>
                      editComment(
                        new Event("submit") as unknown as React.FormEvent,
                      )
                    }
                    onCancel={() => setEditingComment(null)}
                    onDelete={() => deleteComment(comment._id)}
                    onLike={() => toggleCommentLike(comment._id)}
                    currentUserId={userId}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-50 md:hidden">
        <NavIcon Icon={Home} label="Home" active />
        <NavIcon Icon={Compass} label="Explore" />
        <NavIcon Icon={Bell} label="Alerts" />
        <NavIcon Icon={User} label="Profile" />
      </nav>
    </div>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  editing: boolean;
  onEditContentChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onLike: () => void;
  currentUserId: string;
}

const CommentItem = ({
  comment,
  editing,
  onEditContentChange,
  onSave,
  onCancel,
  onDelete,
  onLike,
  currentUserId,
}: CommentItemProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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
              value={onEditContentChange.toString()} // This will be passed properly
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
              <div className="flex items-center gap-2">
                {currentUserId === comment.user._id && (
                  <>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                    </button>
                  </>
                )}
              </div>
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
