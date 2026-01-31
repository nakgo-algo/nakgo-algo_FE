import { useState, useMemo, useRef, useEffect } from 'react'
import regulationsData from '../data/regulationsData.js'

// 지역 목록 (지도 + 바다권역)
const allRegions = Object.entries(regulationsData).map(([id, d]) => ({
  id,
  name: d.name,
}))

// SVG 지도용 시도 path 데이터 (실제 대한민국 지도 형태 근사)
const provinces = [
  // 경기도 (서울·인천 포함 큰 영역, 서북쪽)
  { id: 'gyeonggi', name: '경기', path: 'M108,108 L130,95 L155,98 L168,108 L172,120 L168,138 L162,148 L155,155 L140,158 L128,162 L118,158 L105,148 L95,138 L92,128 L95,118 Z', tx: 132, ty: 130 },
  // 서울 (경기 내부 작은 영역)
  { id: 'seoul', name: '서울', path: 'M133,118 L142,116 L148,120 L148,128 L143,132 L134,132 L130,128 L130,122 Z', tx: 139, ty: 126 },
  // 인천 (경기 서쪽 해안)
  { id: 'incheon', name: '인천', path: 'M95,120 L108,115 L112,120 L112,132 L108,138 L98,140 L90,135 L88,128 Z', tx: 100, ty: 130 },
  // 강원도 (동북쪽, 크고 세로로 긴 형태)
  { id: 'gangwon', name: '강원', path: 'M168,70 L188,65 L210,72 L228,85 L238,100 L240,120 L235,145 L225,165 L212,178 L195,182 L180,175 L170,162 L165,148 L168,138 L172,120 L170,105 L165,90 Z', tx: 202, ty: 125 },
  // 충청북도 (중부 내륙)
  { id: 'chungbuk', name: '충북', path: 'M145,160 L162,155 L175,162 L185,175 L188,190 L182,205 L170,212 L155,210 L142,202 L135,192 L132,178 L135,168 Z', tx: 160, ty: 185 },
  // 세종
  { id: 'sejong', name: '세종', path: 'M128,188 L136,185 L140,190 L138,198 L132,200 L126,196 Z', tx: 133, ty: 194 },
  // 대전
  { id: 'daejeon', name: '대전', path: 'M138,202 L148,200 L153,205 L152,214 L146,218 L138,215 L135,208 Z', tx: 145, ty: 210 },
  // 충청남도 (서쪽 해안, 서해 돌출)
  { id: 'chungnam', name: '충남', path: 'M72,158 L92,148 L108,150 L120,158 L130,168 L135,182 L130,195 L125,205 L118,215 L108,222 L95,225 L80,218 L68,208 L60,195 L58,180 L62,168 Z', tx: 95, ty: 190 },
  // 전라북도
  { id: 'jeonbuk', name: '전북', path: 'M72,225 L92,222 L108,225 L122,218 L135,225 L142,238 L140,252 L132,262 L118,268 L102,270 L85,265 L72,255 L65,242 Z', tx: 105, ty: 245 },
  // 전라남도 (남서쪽, 해안선 복잡)
  { id: 'jeonnam', name: '전남', path: 'M55,268 L72,260 L88,265 L102,272 L118,270 L128,275 L135,288 L132,305 L125,318 L115,328 L100,335 L82,332 L65,325 L52,312 L45,298 L45,282 Z', tx: 90, ty: 300 },
  // 광주 (전남 내부)
  { id: 'gwangju', name: '광주', path: 'M92,280 L102,278 L107,283 L106,292 L100,296 L92,293 L88,287 Z', tx: 98, ty: 288 },
  // 경상북도 (동쪽 큰 영역)
  { id: 'gyeongbuk', name: '경북', path: 'M188,175 L205,178 L222,172 L235,180 L245,195 L248,215 L245,235 L238,250 L225,258 L210,260 L198,255 L188,245 L180,232 L175,218 L175,200 L178,188 Z', tx: 215, ty: 218 },
  // 대구 (경북 내부)
  { id: 'daegu', name: '대구', path: 'M198,232 L208,228 L215,233 L215,243 L210,248 L200,248 L195,242 L195,236 Z', tx: 205, ty: 240 },
  // 경상남도
  { id: 'gyeongnam', name: '경남', path: 'M128,268 L145,262 L162,258 L178,255 L192,258 L205,265 L215,278 L218,295 L212,310 L198,318 L180,322 L160,318 L142,310 L132,298 L125,282 Z', tx: 170, ty: 290 },
  // 부산 (동남쪽 끝)
  { id: 'busan', name: '부산', path: 'M215,292 L225,288 L232,295 L232,308 L226,315 L218,315 L212,308 L212,298 Z', tx: 222, ty: 303 },
  // 울산
  { id: 'ulsan', name: '울산', path: 'M225,258 L236,255 L242,262 L242,275 L236,282 L226,282 L220,275 L220,265 Z', tx: 232, ty: 270 },
  // 제주도 (남쪽 섬, 타원형)
  { id: 'jeju', name: '제주', path: 'M95,375 L115,368 L135,368 L148,375 L152,385 L148,395 L135,402 L115,402 L98,398 L90,390 L88,382 Z', tx: 120, ty: 386 },
]

// 바다권역 라벨
const seaLabels = [
  { id: 'westSea', name: '서해권', x: 42, y: 220 },
  { id: 'eastSea', name: '동해권', x: 265, y: 170 },
  { id: 'southSea', name: '남해권', x: 155, y: 355 },
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
          <svg viewBox="30 55 260 365" className="w-full" style={{ maxHeight: '400px' }}>
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
