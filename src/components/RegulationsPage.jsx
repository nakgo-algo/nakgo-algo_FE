import { useState, useMemo, useRef, useEffect } from 'react'
import regulationsData from '../data/regulationsData.js'

// 지역 목록 (지도 + 바다권역)
const allRegions = Object.entries(regulationsData).map(([id, d]) => ({
  id,
  name: d.name,
}))

// SVG 지도용 시도 path 데이터 (단순화된 대한민국 지도)
const provinces = [
  { id: 'seoul', name: '서울', path: 'M145,155 l8,0 4,4 0,8 -4,4 -8,0 -4,-4 0,-8z', tx: 143, ty: 167 },
  { id: 'incheon', name: '인천', path: 'M123,152 l10,0 5,5 0,10 -5,5 -10,0 -5,-5 0,-10z', tx: 122, ty: 165 },
  { id: 'gyeonggi', name: '경기', path: 'M118,125 l50,0 8,12 5,20 -5,20 -10,10 -20,5 -20,-2 -15,-15 -5,-20 2,-18z', tx: 135, ty: 152 },
  { id: 'gangwon', name: '강원', path: 'M175,95 l55,5 15,20 5,35 -10,30 -25,15 -30,-5 -15,-20 -10,-30 5,-35z', tx: 195, ty: 140 },
  { id: 'sejong', name: '세종', path: 'M138,195 l10,0 4,6 0,8 -4,4 -10,0 -4,-4 0,-8z', tx: 133, ty: 207 },
  { id: 'daejeon', name: '대전', path: 'M148,205 l10,0 5,5 0,10 -5,5 -10,0 -5,-5 0,-10z', tx: 143, ty: 218 },
  { id: 'chungbuk', name: '충북', path: 'M155,175 l30,0 10,10 5,25 -10,15 -25,5 -18,-5 -8,-18 3,-20z', tx: 158, ty: 198 },
  { id: 'chungnam', name: '충남', path: 'M90,185 l40,0 8,15 0,25 -15,15 -30,5 -18,-10 -5,-25 10,-18z', tx: 100, ty: 210 },
  { id: 'jeonbuk', name: '전북', path: 'M85,240 l45,0 10,12 0,25 -15,12 -35,3 -15,-12 -3,-25z', tx: 100, ty: 262 },
  { id: 'jeonnam', name: '전남', path: 'M70,290 l60,0 12,20 5,30 -10,20 -40,8 -30,-5 -15,-18 -2,-30 10,-18z', tx: 95, ty: 320 },
  { id: 'gwangju', name: '광주', path: 'M100,295 l10,0 4,5 0,8 -4,4 -10,0 -4,-4 0,-8z', tx: 95, ty: 307 },
  { id: 'gyeongbuk', name: '경북', path: 'M190,175 l45,5 15,20 5,40 -15,25 -35,8 -25,-8 -12,-25 0,-40z', tx: 205, ty: 215 },
  { id: 'daegu', name: '대구', path: 'M195,235 l12,0 5,5 0,10 -5,5 -12,0 -5,-5 0,-10z', tx: 190, ty: 248 },
  { id: 'gyeongnam', name: '경남', path: 'M145,270 l50,0 12,15 5,25 -10,18 -40,5 -25,-8 -10,-22 5,-22z', tx: 163, ty: 298 },
  { id: 'busan', name: '부산', path: 'M210,295 l12,0 5,6 0,10 -5,5 -12,0 -5,-5 0,-10z', tx: 207, ty: 308 },
  { id: 'ulsan', name: '울산', path: 'M218,265 l12,0 5,6 0,10 -5,5 -12,0 -5,-5 0,-10z', tx: 213, ty: 278 },
  { id: 'jeju', name: '제주', path: 'M90,380 l40,0 10,8 5,15 -5,12 -15,5 -30,0 -12,-8 -3,-15 5,-12z', tx: 100, ty: 397 },
]

// 바다권역 라벨
const seaLabels = [
  { id: 'westSea', name: '서해권', x: 38, y: 250 },
  { id: 'eastSea', name: '동해권', x: 252, y: 180 },
  { id: 'southSea', name: '남해권', x: 145, y: 360 },
]

export default function RegulationsPage() {
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const data = selected ? regulationsData[selected] : null

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    return allRegions.filter((r) => r.name.includes(search.trim()))
  }, [search])

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id) => {
    setSelected(id)
    setSearch('')
    setShowSuggestions(false)
  }

  return (
    <div className="h-full gradient-mid pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-20 left-0 w-48 h-48 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100, 140, 180, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-6 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            규정 확인
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Regulations
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          지역을 클릭하거나 검색하여 금어기 / 금지체장을 확인하세요
        </p>
      </div>

      {/* Search bar */}
      <div className="relative z-20 mb-5" ref={searchRef}>
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => search && setShowSuggestions(true)}
            placeholder="지역명 검색 (예: 강원, 동해권)"
            className="bg-transparent border-none outline-none flex-1 font-sans text-[14px] text-white/80 placeholder:text-white/30"
          />
        </div>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(30, 40, 55, 0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {suggestions.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className="w-full text-left px-4 py-3 font-sans text-[14px] text-white/75 border-none cursor-pointer transition-colors duration-150"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Map */}
      <div className="relative z-10 mb-6">
        <div
          className="rounded-2xl p-3 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <svg viewBox="20 80 270 350" className="w-full" style={{ maxHeight: '380px' }}>
            {/* 시도 영역 */}
            {provinces.map((p) => (
              <g key={p.id} onClick={() => handleSelect(p.id)} style={{ cursor: 'pointer' }}>
                <path
                  d={p.path}
                  fill={selected === p.id ? 'rgba(96, 165, 250, 0.45)' : 'rgba(255,255,255,0.1)'}
                  stroke={selected === p.id ? 'rgba(96, 165, 250, 0.8)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={selected === p.id ? 1.5 : 0.8}
                  style={{ transition: 'all 0.2s' }}
                />
                <text
                  x={p.tx}
                  y={p.ty}
                  textAnchor="middle"
                  fill={selected === p.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)'}
                  fontSize="7"
                  fontFamily="sans-serif"
                  fontWeight={selected === p.id ? 600 : 400}
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                >
                  {p.name}
                </text>
              </g>
            ))}

            {/* 바다권역 라벨 */}
            {seaLabels.map((s) => (
              <g key={s.id} onClick={() => handleSelect(s.id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={s.x - 18}
                  y={s.y - 8}
                  width={36}
                  height={16}
                  rx={4}
                  fill={selected === s.id ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.1)'}
                  stroke={selected === s.id ? 'rgba(56, 189, 248, 0.6)' : 'rgba(56, 189, 248, 0.25)'}
                  strokeWidth={0.7}
                  style={{ transition: 'all 0.2s' }}
                />
                <text
                  x={s.x}
                  y={s.y + 3}
                  textAnchor="middle"
                  fill={selected === s.id ? 'rgba(186, 230, 253, 1)' : 'rgba(186, 230, 253, 0.6)'}
                  fontSize="6.5"
                  fontFamily="sans-serif"
                  fontWeight={500}
                  style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
                >
                  {s.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Content */}
      {!data ? (
        <div className="relative z-10 h-40 flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <span className="font-sans text-2xl text-white/20">?</span>
          </div>
          <p className="font-sans text-[14px] text-white/30 text-center leading-relaxed">
            지도에서 지역을 선택하거나
            <br />
            검색하여 규정을 확인하세요
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-5 animate-fadeUp">
          {/* Region Header */}
          <div className="mb-2">
            <div className="flex items-baseline gap-3">
              <h2 className="font-sans text-[36px] font-extralight text-white/85 tracking-tight">
                {data.name}
              </h2>
              <span className="font-mono text-[10px] text-white/25 tracking-wider">
                {data.nameEn}
              </span>
            </div>
          </div>

          {/* Prohibited / Closed Season */}
          <div
            className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(150, 90, 90, 0.18) 0%, rgba(120, 70, 70, 0.08) 100%)',
              border: '1px solid rgba(180, 110, 110, 0.12)',
            }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }}
            />
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-rose-400/60" />
              <h3 className="font-sans text-[13px] font-medium text-rose-300/80">
                금지어종 / 금어기
              </h3>
            </div>
            <div className="space-y-0">
              {data.prohibited.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span className="font-sans text-[15px] text-white/80">{item.name}</span>
                  <span
                    className="font-mono text-[11px] text-white/50 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    {item.period}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Size */}
          <div
            className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(70, 130, 130, 0.18) 0%, rgba(50, 100, 100, 0.08) 100%)',
              border: '1px solid rgba(100, 160, 160, 0.12)',
            }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: 'linear-gradient(180deg, #2dd4bf, #14b8a6)' }}
            />
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-teal-400/60" />
              <h3 className="font-sans text-[13px] font-medium text-teal-300/80">
                금지체장
              </h3>
            </div>
            <div className="space-y-0">
              {data.minSize.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span className="font-sans text-[15px] text-white/80">{item.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-[20px] font-light text-white/85">
                      {item.size}
                    </span>
                    <span className="font-sans text-[11px] text-white/35">cm 이상</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 pt-2 px-1">
            <span className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
            <p className="font-sans text-[11px] text-white/30 leading-relaxed">
              규정은 변경될 수 있습니다. 출조 전 해당 지역 관할 기관에 최신 정보를 확인하세요.
            </p>
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}
