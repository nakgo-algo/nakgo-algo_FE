import { useState, useEffect } from 'react'
import api from '../api'

export default function FinesPage() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/fines')
      .then(setFines)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">벌금 안내</h1>
        <p className="text-sm text-slate-400">위반 시 부과되는 벌금 정보</p>
      </div>

      {/* Notice */}
      <div className="mb-6 py-3 px-4 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 leading-relaxed">
          벌금 기준은 지역과 상황에 따라 다를 수 있습니다.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((fine) => (
            <div key={fine.id} className="py-4 border-b border-slate-700/50 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                  {fine.species || '일반'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {fine.legalBasis}
                </span>
              </div>
              <h3 className="text-white text-base mb-2">{fine.violation}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-light text-white">{fine.fineAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-slate-500 leading-relaxed">
        * 위 정보는 참고용이며, 실제 처벌은 관련 법률에 따라 달라질 수 있습니다.
      </p>
      <div className="h-20" />
    </div>
  )
}
