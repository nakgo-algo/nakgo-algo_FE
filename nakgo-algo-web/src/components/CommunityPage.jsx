import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

export default function CommunityPage() {
  const { isLoggedIn } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  const fetchPosts = useCallback(async () => {
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      const data = await api.get(`/posts${params}`)
      setPosts(data)
    } catch {
      setPosts([])
    }
    setLoading(false)
  }, [searchQuery])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(fetchPosts, 300)
    return () => clearTimeout(timer)
  }, [fetchPosts])

  const handlePostCreated = () => {
    setShowWriteModal(false)
    fetchPosts()
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-4">자유게시판</h1>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 내용 검색"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-600"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            게시글이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post.id)}
                className="px-5 py-4 active:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {/* Title */}
                <h3 className="text-white font-medium mb-2 line-clamp-1">
                  {post.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-slate-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400">{post.author}</span>
                  <span className="text-xs text-slate-600">{post.date}</span>
                </div>

                {/* Image Preview */}
                {post.image && (
                  <div className="mb-3 rounded-lg bg-slate-800 h-32 flex items-center justify-center overflow-hidden">
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content Preview */}
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* Comment Count */}
                <div className="flex items-center gap-1 text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs">{post.comments}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Write Button (FAB) */}
      <button
        onClick={() => {
          if (!isLoggedIn) {
            alert('로그인이 필요합니다')
            return
          }
          setShowWriteModal(true)
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Write Modal */}
      {showWriteModal && (
        <WritePostModal
          onClose={() => setShowWriteModal(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          postId={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function WritePostModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/posts', { title: title.trim(), content: content.trim() })
      onCreated()
    } catch {
      alert('게시글 등록에 실패했습니다')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">글쓰기</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 mb-3"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}

function PostDetailModal({ postId, onClose }) {
  const { isLoggedIn } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/posts/${postId}`)
      .then(setPost)
      .catch(() => onClose())
      .finally(() => setLoading(false))
  }, [postId])

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const comment = await api.post(`/posts/${postId}/comments`, { text: commentText.trim() })
      setPost(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }))
      setCommentText('')
    } catch {
      alert('댓글 등록에 실패했습니다')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">게시글</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : post ? (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-white text-lg font-semibold mb-2">{post.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-400">{post.author}</span>
                <span className="text-xs text-slate-600">{post.date}</span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap mb-6">{post.content}</p>

              {/* Comments */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-500 mb-3">
                  댓글 {post.comments?.length || 0}
                </p>
                <div className="space-y-3">
                  {(post.comments || []).map((c) => (
                    <div key={c.id} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-300 font-medium">{c.author}</span>
                        <span className="text-[10px] text-slate-600">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            {isLoggedIn && (
              <div className="p-4 border-t border-slate-700 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {submitting ? '...' : '등록'}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
