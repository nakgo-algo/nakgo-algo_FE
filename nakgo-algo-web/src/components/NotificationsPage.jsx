import { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'

const TYPE_STYLES = {
  post_deleted: { label: '삭제', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  report_completed: { label: '반영', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  moderation_request: { label: '검토', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}

export default function NotificationsPage() {
  const { isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        // 전체 읽음 처리
        await api.put('/notifications/read-all')
        const data = await api.get('/notifications')
        setNotifications(data)
      } catch {
        setNotifications([])
      }
      setLoading(false)
    }
    load()
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500 text-sm">로그인이 필요합니다</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">알림</h1>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-slate-500 text-sm">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {notifications.map((n) => {
              const style = TYPE_STYLES[n.type] || TYPE_STYLES.moderation_request
              return (
                <div key={n.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    {/* Type Badge */}
                    <span className={`shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                      {style.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium mb-1">{n.title}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{n.message}</p>
                      <p className="text-slate-600 text-[10px] mt-2">{n.createdAt}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
