import { useState } from 'react'

// 한국 주요 어종 규제 정보 (수산자원관리법 기준)
const fishData = {
  '광어': { nameEn: 'Flatfish', minSize: 35, closedSeason: null },
  '넙치': { nameEn: 'Olive Flounder', minSize: 35, closedSeason: null },
  '우럭': { nameEn: 'Rockfish', minSize: 23, closedSeason: '4월 1일 ~ 5월 31일' },
  '조피볼락': { nameEn: 'Korean Rockfish', minSize: 23, closedSeason: '4월 1일 ~ 5월 31일' },
  '참돔': { nameEn: 'Red Sea Bream', minSize: 24, closedSeason: null },
  '감성돔': { nameEn: 'Black Porgy', minSize: 25, closedSeason: '5월 1일 ~ 6월 30일' },
  '농어': { nameEn: 'Sea Bass', minSize: 30, closedSeason: null },
  '대구': { nameEn: 'Pacific Cod', minSize: 35, closedSeason: '1월 16일 ~ 2월 15일' },
  '방어': { nameEn: 'Yellowtail', minSize: 40, closedSeason: null },
  '부시리': { nameEn: 'Amberjack', minSize: 40, closedSeason: null },
  '고등어': { nameEn: 'Mackerel', minSize: 21, closedSeason: null },
  '삼치': { nameEn: 'Spanish Mackerel', minSize: 35, closedSeason: null },
  '전갱이': { nameEn: 'Horse Mackerel', minSize: 15, closedSeason: null },
  '볼락': { nameEn: 'Rockfish', minSize: 15, closedSeason: '4월 1일 ~ 5월 31일' },
  '숭어': { nameEn: 'Mullet', minSize: 25, closedSeason: null },
  '민어': { nameEn: 'Croaker', minSize: 30, closedSeason: '7월 1일 ~ 7월 31일' },
  '조기': { nameEn: 'Yellow Croaker', minSize: 15, closedSeason: null },
  '노래미': { nameEn: 'Greenling', minSize: 15, closedSeason: null },
  '돌돔': { nameEn: 'Parrotfish', minSize: 24, closedSeason: null },
  '연어': { nameEn: 'Salmon', minSize: 40, closedSeason: '10월 ~ 11월 (산란기)' },
  '갈치': { nameEn: 'Cutlassfish', minSize: null, closedSeason: null },
  '오징어': { nameEn: 'Squid', minSize: null, closedSeason: null },
  '문어': { nameEn: 'Octopus', minSize: null, closedSeason: null },
  '주꾸미': { nameEn: 'Webfoot Octopus', minSize: null, closedSeason: null },
  '꽃게': { nameEn: 'Blue Crab', minSize: null, closedSeason: '6월 21일 ~ 8월 20일 (암컷)' },
  '대게': { nameEn: 'Snow Crab', minSize: null, closedSeason: null },
  '붕어': { nameEn: 'Crucian Carp', minSize: null, closedSeason: null },
  '잉어': { nameEn: 'Common Carp', minSize: null, closedSeason: null },
  '배스': { nameEn: 'Largemouth Bass', minSize: null, closedSeason: null, warning: '생태계교란종' },
  '블루길': { nameEn: 'Bluegill', minSize: null, closedSeason: null, warning: '생태계교란종' },
}

const fishList = Object.keys(fishData)

export default function CheckPage() {
  const [fish, setFish] = useState('')
  const [customFish, setCustomFish] = useState('')
  const [length, setLength] = useState('')
  const [result, setResult] = useState(null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleFishChange = (e) => {
    const value = e.target.value
    if (value === '__custom__') {
      setShowCustomInput(true)
      setFish('')
    } else {
      setShowCustomInput(false)
      setFish(value)
      setCustomFish('')
    }
  }

  const handleCheck = async () => {
    const selectedFish = showCustomInput ? customFish : fish

    if (!selectedFish) {
      alert('어종을 선택하거나 입력해 주세요.')
      return
    }

    const lengthNum = parseFloat(length)
    if (isNaN(lengthNum) || lengthNum <= 0) {
      alert('올바른 길이를 입력해 주세요. (0cm 초과)')
      return
    }

    // 데이터베이스에서 어종 찾기
    let data = fishData[selectedFish]

    // 정확히 일치하지 않으면 부분 일치 검색
    if (!data) {
      const matchedFish = fishList.find(f => f.includes(selectedFish) || selectedFish.includes(f))
      if (matchedFish) {
        data = { ...fishData[matchedFish], name: matchedFish }
      }
    }

    if (!data) {
      // 알 수 없는 어종
      setResult({
        status: 'unknown',
        fishName: selectedFish,
        inputLength: lengthNum,
        message: '해당 어종의 규제 정보를 찾을 수 없습니다. 지역 수산관서에 문의하세요.',
      })
      return
    }

    // 판정
    const fishName = data.name || selectedFish

    if (data.warning) {
      // 생태계교란종
      setResult({
        status: 'invasive',
        fish: { name: fishName, ...data },
        inputLength: lengthNum,
      })
    } else if (data.minSize && lengthNum < data.minSize) {
      // 체장 미달
      setResult({
        status: 'prohibited',
        fish: { name: fishName, ...data },
        inputLength: lengthNum,
      })
    } else if (data.closedSeason) {
      // 금어기 있음
      setResult({
        status: 'restricted',
        fish: { name: fishName, ...data },
        inputLength: lengthNum,
      })
    } else {
      // 포획 가능
      setResult({
        status: 'allowed',
        fish: { name: fishName, ...data },
        inputLength: lengthNum,
      })
    }
  }

  return (
    <div className="h-full gradient-shallow pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(80, 160, 180, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-8 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            위반 판단
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Check
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          어종과 크기를 입력하면 포획 가능 여부를 알려드립니다
        </p>
      </div>

      {/* Form */}
      <div className="relative z-10 space-y-4">
        {/* Fish Select/Input Card */}
        <div
          className="p-5 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(70, 120, 130, 0.2) 0%, rgba(50, 90, 100, 0.08) 100%)',
            border: '1px solid rgba(100, 160, 170, 0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-[11px] font-medium text-white/50 tracking-wide">
              어종
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50" />
          </div>

          {!showCustomInput ? (
            <select
              value={fish}
              onChange={handleFishChange}
              className="w-full bg-transparent border-none p-0 font-sans text-[20px] font-light text-white/90 outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.3)' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0 center',
              }}
            >
              <option value="">선택하세요</option>
              <option value="__custom__">직접 입력</option>
              <option disabled>──────────</option>
              {fishList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customFish}
                  onChange={(e) => setCustomFish(e.target.value)}
                  placeholder="어종명 입력 (예: 광어)"
                  autoFocus
                  className="flex-1 bg-transparent border-none p-0 font-sans text-[20px] font-light text-white/90 outline-none placeholder:text-white/25"
                />
                <button
                  onClick={() => { setShowCustomInput(false); setCustomFish(''); }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white/60 text-[12px] hover:bg-white/20 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Length Input Card */}
        <div
          className="p-5 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
            border: '1px solid rgba(80, 140, 160, 0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-[11px] font-medium text-white/50 tracking-wide">
              전장 길이
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
          </div>
          <div className="flex items-baseline gap-3">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="flex-1 bg-transparent border-none p-0 font-sans text-[48px] font-extralight text-white/90 outline-none placeholder:text-white/15 tracking-tight"
            />
            <span className="font-sans text-[15px] font-light text-white/35">cm</span>
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          className="w-full py-4 mt-2 font-sans text-[14px] font-semibold tracking-wide text-white/90 border-none cursor-pointer rounded-2xl transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(65, 125, 140, 0.85) 0%, rgba(45, 100, 115, 0.9) 100%)',
            boxShadow: '0 4px 20px rgba(0, 60, 80, 0.25)',
          }}
        >
          판정하기
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="relative z-10 mt-8 animate-fadeUp">
          {result.status === 'unknown' ? (
            // 알 수 없는 어종
            <div
              className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(100, 100, 100, 0.2) 0%, rgba(80, 80, 80, 0.1) 100%)',
                border: '1px solid rgba(150, 150, 150, 0.15)',
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-400/50 rounded-l-2xl" />
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gray-500/15 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  정보 없음
                </span>
              </div>
              <h2 className="font-sans text-[22px] font-semibold text-white/90 mb-2">
                {result.fishName}
              </h2>
              <p className="font-sans text-[13px] text-white/50 leading-relaxed mb-4">
                {result.message}
              </p>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="font-sans text-[12px] text-white/40">
                  입력 길이: <span className="text-white/70">{result.inputLength}cm</span>
                </p>
              </div>
            </div>
          ) : (
            // 일반 결과
            <div
              className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
              style={{
                background: result.status === 'allowed'
                  ? 'linear-gradient(145deg, rgba(60, 130, 120, 0.25) 0%, rgba(40, 100, 90, 0.1) 100%)'
                  : result.status === 'prohibited'
                  ? 'linear-gradient(145deg, rgba(140, 70, 70, 0.25) 0%, rgba(110, 50, 50, 0.1) 100%)'
                  : result.status === 'invasive'
                  ? 'linear-gradient(145deg, rgba(140, 100, 60, 0.25) 0%, rgba(110, 80, 40, 0.1) 100%)'
                  : 'linear-gradient(145deg, rgba(150, 120, 60, 0.25) 0%, rgba(120, 95, 40, 0.1) 100%)',
                border: `1px solid ${
                  result.status === 'allowed'
                    ? 'rgba(100, 180, 160, 0.2)'
                    : result.status === 'prohibited'
                    ? 'rgba(180, 100, 100, 0.2)'
                    : result.status === 'invasive'
                    ? 'rgba(200, 150, 100, 0.2)'
                    : 'rgba(180, 150, 80, 0.2)'
                }`,
              }}
            >
              {/* Status indicator line */}
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{
                  background: result.status === 'allowed'
                    ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                    : result.status === 'prohibited'
                    ? 'linear-gradient(180deg, #f87171, #ef4444)'
                    : result.status === 'invasive'
                    ? 'linear-gradient(180deg, #fb923c, #f97316)'
                    : 'linear-gradient(180deg, #fbbf24, #f59e0b)',
                }}
              />

              {/* Status Badge */}
              <div className="mb-5">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: result.status === 'allowed'
                      ? 'rgba(74, 222, 128, 0.15)'
                      : result.status === 'prohibited'
                      ? 'rgba(248, 113, 113, 0.15)'
                      : result.status === 'invasive'
                      ? 'rgba(251, 146, 60, 0.15)'
                      : 'rgba(251, 191, 36, 0.15)',
                    color: result.status === 'allowed'
                      ? '#86efac'
                      : result.status === 'prohibited'
                      ? '#fca5a5'
                      : result.status === 'invasive'
                      ? '#fdba74'
                      : '#fcd34d',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: result.status === 'allowed'
                        ? '#4ade80'
                        : result.status === 'prohibited'
                        ? '#f87171'
                        : result.status === 'invasive'
                        ? '#fb923c'
                        : '#fbbf24',
                    }}
                  />
                  {result.status === 'allowed' && '포획 가능'}
                  {result.status === 'prohibited' && '포획 금지'}
                  {result.status === 'restricted' && '금어기 주의'}
                  {result.status === 'invasive' && '생태계교란종'}
                </span>
              </div>

              {/* Fish Info */}
              <div className="mb-6">
                <h2 className="font-sans text-[26px] font-semibold text-white/90 tracking-tight mb-0.5">
                  {result.fish.name}
                </h2>
                <p className="font-mono text-[10px] text-white/30 tracking-wider">
                  {result.fish.nameEn}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/8">
                <div>
                  <span className="block font-sans text-[10px] text-white/40 mb-1">입력 길이</span>
                  <span className="font-sans text-[18px] font-light text-white/85">
                    {result.inputLength}
                    <span className="text-[12px] text-white/40 ml-1">cm</span>
                  </span>
                </div>
                {result.fish.minSize && (
                  <div>
                    <span className="block font-sans text-[10px] text-white/40 mb-1">최소 체장</span>
                    <span className="font-sans text-[18px] font-light text-white/85">
                      {result.fish.minSize}
                      <span className="text-[12px] text-white/40 ml-1">cm</span>
                    </span>
                  </div>
                )}
                {result.fish.closedSeason && (
                  <div className="col-span-2">
                    <span className="block font-sans text-[10px] text-white/40 mb-1">금어기</span>
                    <span className="font-sans text-[14px] text-white/85">
                      {result.fish.closedSeason}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Messages */}
              {result.status === 'prohibited' && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/10">
                  <p className="font-sans text-[12px] text-rose-200/70 leading-relaxed">
                    금지체장 미달입니다. 포획 및 유통이 금지됩니다. 즉시 방류해 주세요.
                  </p>
                </div>
              )}
              {result.status === 'restricted' && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/10">
                  <p className="font-sans text-[12px] text-amber-200/70 leading-relaxed">
                    금어기 기간을 확인하세요. 해당 기간 중 포획이 금지됩니다.
                  </p>
                </div>
              )}
              {result.status === 'invasive' && (
                <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/10">
                  <p className="font-sans text-[12px] text-orange-200/70 leading-relaxed">
                    생태계교란종입니다. 포획 후 자연에 방류하지 마세요. 생태계 보호를 위해 폐기를 권장합니다.
                  </p>
                </div>
              )}
              {result.status === 'allowed' && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                  <p className="font-sans text-[12px] text-emerald-200/70 leading-relaxed">
                    포획 및 유통이 가능합니다. 지역별 추가 규정을 확인하세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}
