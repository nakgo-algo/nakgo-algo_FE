import { useState, useRef } from 'react'

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''

const koreanFishRegulations = {
  '광어': { minLength: 35, closedSeason: null, warning: null, description: '대표적인 고급 횟감', keywords: ['flatfish', 'flounder', 'halibut'] },
  '넙치': { minLength: 35, closedSeason: null, warning: null, description: '광어의 정식 명칭', keywords: ['flatfish', 'flounder'] },
  '우럭': { minLength: 23, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '볼락류 중 가장 대형', keywords: ['rockfish', 'black rockfish', 'sebastes'] },
  '농어': { minLength: 30, closedSeason: null, warning: null, description: '회유성 어종', keywords: ['sea bass', 'bass', 'perch'] },
  '감성돔': { minLength: 25, closedSeason: '5월 1일 ~ 6월 30일', warning: null, description: '낚시인 인기 대상어', keywords: ['black porgy', 'sea bream', 'porgy'] },
  '참돔': { minLength: 24, closedSeason: null, warning: null, description: '고급 어종', keywords: ['red sea bream', 'snapper', 'tai'] },
  '대구': { minLength: 35, closedSeason: '1월 16일 ~ 2월 15일', warning: null, description: '겨울철 대표 어종', keywords: ['cod', 'pacific cod'] },
  '방어': { minLength: 40, closedSeason: null, warning: null, description: '겨울철 최고급 횟감', keywords: ['yellowtail', 'amberjack', 'buri'] },
  '고등어': { minLength: 21, closedSeason: null, warning: null, description: '등푸른 생선 대표', keywords: ['mackerel', 'scomber'] },
  '삼치': { minLength: 35, closedSeason: null, warning: null, description: '가을철 대표 낚시어', keywords: ['spanish mackerel', 'sawara'] },
  '전갱이': { minLength: 15, closedSeason: null, warning: null, description: '방파제 낚시 인기', keywords: ['horse mackerel', 'jack mackerel', 'aji'] },
  '볼락': { minLength: 15, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '야간 낚시 인기', keywords: ['rockfish', 'sebastes'] },
  '숭어': { minLength: 25, closedSeason: null, warning: null, description: '겨울 회가 맛있음', keywords: ['mullet', 'grey mullet'] },
  '갈치': { minLength: null, closedSeason: null, warning: '날카로운 이빨 주의', description: '은빛 긴 몸체', keywords: ['cutlassfish', 'hairtail', 'ribbonfish'] },
  '복어': { minLength: null, closedSeason: null, warning: '맹독 주의!', description: '독성 어종', keywords: ['puffer', 'fugu', 'blowfish'] },
  '가오리': { minLength: null, closedSeason: null, warning: '꼬리 독침 주의!', description: '납작한 몸체', keywords: ['ray', 'stingray', 'skate'] },
  '배스': { minLength: null, closedSeason: null, warning: '생태계교란종', description: '민물 포식자', keywords: ['bass', 'largemouth bass', 'black bass'] },
  '붕어': { minLength: null, closedSeason: null, warning: null, description: '민물낚시 대표', keywords: ['crucian carp', 'carp', 'goldfish'] },
  '잉어': { minLength: null, closedSeason: null, warning: null, description: '대형 민물고기', keywords: ['carp', 'common carp', 'koi'] },
  '연어': { minLength: 40, closedSeason: '10월~11월', warning: null, description: '회유성 어종', keywords: ['salmon', 'chum salmon', 'coho'] },
  '송어': { minLength: null, closedSeason: null, warning: null, description: '냉수 민물고기', keywords: ['trout', 'rainbow trout'] },
  '참치': { minLength: null, closedSeason: null, warning: null, description: '대형 회유어종', keywords: ['tuna', 'bluefin'] },
  '오징어': { minLength: null, closedSeason: null, warning: null, description: '에깅 낚시 인기', keywords: ['squid', 'calamari'] },
  '문어': { minLength: null, closedSeason: null, warning: null, description: '문어낚시 인기', keywords: ['octopus'] },
}

const fishList = Object.keys(koreanFishRegulations)

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [showManualSelect, setShowManualSelect] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setShowManualSelect(false)

    await analyzeWithHuggingFace(file)
  }

  const analyzeWithHuggingFace = async (file) => {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
          body: file,
        }
      )

      if (!response.ok) throw new Error(`API 오류: ${response.status}`)

      const data = await response.json()
      const caption = data[0]?.generated_text || ''

      const matchedFish = matchFishFromCaption(caption)

      if (matchedFish) {
        const reg = koreanFishRegulations[matchedFish]
        setResult({
          isFish: true, name: matchedFish, caption, confidence: 75,
          ...reg
        })
      } else if (caption.toLowerCase().includes('fish')) {
        setResult({ isFish: true, name: '어종 미확인', caption, confidence: 40 })
        setShowManualSelect(true)
      } else {
        setResult({ isFish: false, caption })
      }
    } catch (err) {
      setError(err.message)
      setShowManualSelect(true)
    }
    setIsAnalyzing(false)
  }

  const matchFishFromCaption = (caption) => {
    const lower = caption.toLowerCase()
    for (const [name, data] of Object.entries(koreanFishRegulations)) {
      if (data.keywords?.some(k => lower.includes(k))) return name
    }
    return null
  }

  const handleManualSelect = (fishName) => {
    const reg = koreanFishRegulations[fishName]
    setResult({ isFish: true, name: fishName, confidence: 100, ...reg })
    setShowManualSelect(false)
  }

  const reset = () => {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setShowManualSelect(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">AI 어종 인식</h1>
        <p className="text-sm text-slate-400">사진으로 어종 분석</p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative rounded-xl overflow-hidden ${!previewUrl ? 'cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-600' : ''}`}
        style={{ minHeight: previewUrl ? 'auto' : '200px' }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="분석 이미지" className="w-full max-h-[40vh] object-contain bg-slate-800 rounded-xl" />
            <button onClick={reset} className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800/90 text-white text-xs rounded-lg">
              다시
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">탭하여 사진 선택</span>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-sm">분석 중...</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Manual Select */}
      {showManualSelect && (
        <div className="mt-4">
          <p className="text-slate-400 text-sm mb-2">어종 직접 선택</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {fishList.map((fish) => (
              <button
                key={fish}
                onClick={() => handleManualSelect(fish)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
              >
                {fish}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4">
          {!result.isFish ? (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400">물고기가 아닌 것 같습니다</p>
              <button onClick={() => setShowManualSelect(true)} className="mt-2 text-teal-400 text-sm">
                직접 선택하기
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              {/* Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                  {result.description && <p className="text-slate-400 text-sm">{result.description}</p>}
                </div>
                {result.confidence && (
                  <span className="text-xs text-slate-500">{result.confidence}%</span>
                )}
              </div>

              {/* Regulations */}
              {(result.minLength || result.closedSeason) && (
                <div className="flex gap-4 py-3 border-t border-slate-700 text-sm">
                  {result.minLength && (
                    <div>
                      <p className="text-slate-500 text-xs">최소 체장</p>
                      <p className="text-white">{result.minLength}cm</p>
                    </div>
                  )}
                  {result.closedSeason && (
                    <div>
                      <p className="text-slate-500 text-xs">금어기</p>
                      <p className="text-yellow-400">{result.closedSeason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Warning */}
              {result.warning && (
                <p className="text-red-400 text-sm mt-3 pt-3 border-t border-slate-700">
                  ⚠ {result.warning}
                </p>
              )}

              {result.confidence < 100 && (
                <button onClick={() => setShowManualSelect(true)} className="mt-3 text-teal-400 text-sm">
                  다른 어종 선택
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}
